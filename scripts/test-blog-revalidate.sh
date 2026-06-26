#!/bin/bash

# ============================================
# Script de prueba para revalidación de blog
# Uso: ./scripts/test-blog-revalidate.sh
# ============================================

# Configuración
DOMAIN="https://tu-dominio.pl"
SECRET="st_cms_rev_2026"
TEST_PATH="/blog/test-seo-automatico"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  Test de Revalidación de Blog"
echo "=========================================="
echo ""

# Test 1: Revalidación exitosa
echo -e "${YELLOW}1. Ejecutando revalidación...${NC}"
echo "   URL: $DOMAIN/api/revalidate"
echo "   Path: $TEST_PATH"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$DOMAIN/api/revalidate" \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"path\": \"$TEST_PATH\", \"tags\": [\"cms-pages\", \"blog-test-seo-automatico\"]}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "   HTTP Status: $HTTP_CODE"
echo "   Response: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Revalidación exitosa${NC}"
else
  echo -e "${RED}✗ Error en revalidación (HTTP $HTTP_CODE)${NC}"
  echo "   Revisar configuración del webhook y endpoint"
fi

echo ""

# Test 2: Verificar acceso sin auth
echo -e "${YELLOW}2. Verificando protección sin auth...${NC}"
RESPONSE2=$(curl -s -w "\n%{http_code}" -X POST "$DOMAIN/api/revalidate" \
  -H "Content-Type: application/json" \
  -d '{"path": "/test"}')

HTTP_CODE2=$(echo "$RESPONSE2" | tail -n 1)

if [ "$HTTP_CODE2" = "401" ]; then
  echo -e "${GREEN}✓ Autorización requerida (correcto)${NC}"
else
  echo -e "${RED}✗ Error: El endpoint permite acceso sin auth (HTTP $HTTP_CODE2)${NC}"
fi

echo ""

# Test 3: Verificar página del blog
echo -e "${YELLOW}3. Verificando página del blog...${NC}"
echo "   URL: $DOMAIN$TEST_PATH"
echo ""

BLOG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$TEST_PATH")

if [ "$BLOG_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Página de blog accesible (HTTP 200)${NC}"
else
  echo -e "${YELLOW}⚠ Página responde con HTTP $BLOG_STATUS${NC}"
fi

echo ""
echo "=========================================="
echo "  Resumen"
echo "=========================================="
echo ""
echo "Si todos los tests pasaron (✓), el sistema está configurado correctamente."
echo ""
echo "Para verificar el Schema JSON-LD:"
echo "1. Ve a https://search.google.com/test/rich-results"
echo "2. Ingresa: $DOMAIN$TEST_PATH"
echo "3. Busca el schema Article en los resultados"
echo ""
echo "Para verificar en consola del navegador:"
echo "1. Abre $DOMAIN$TEST_PATH"
echo "2. Ctrl+U para ver el código fuente"
echo "3. Busca: <script type=\"application/ld+json\">"
echo ""