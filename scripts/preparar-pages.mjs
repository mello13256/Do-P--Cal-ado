/**
 * Ajustes finais do build para o GitHub Pages.
 *
 * O Pages não sabe reescrever rotas: ao abrir /produtos ou /admin direto, ele
 * procura um arquivo com esse nome e devolve 404. O truque padrão é entregar
 * uma cópia do index.html como 404.html — o site carrega e o roteador leva a
 * pessoa para a página certa.
 *
 * O .nojekyll evita que o Jekyll do Pages ignore arquivos com underline.
 */
import { copyFileSync, writeFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/.nojekyll', '')
console.log('build preparado para o GitHub Pages (404.html + .nojekyll)')
