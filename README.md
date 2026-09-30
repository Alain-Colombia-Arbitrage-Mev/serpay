# SE pay — sitio web

Sitio de SE pay: banca de proyectos tokenizados en Avalanche, SE Quant, la red Vox Populi y crédito con la tarjeta SE pay.

Publicado en **https://se-pay.pages.dev** (Cloudflare Pages).

## Estructura

```
contracts/                 Contratos de las Safes (SignerGuard, DelayedRecovery) y sus pruebas
se-pay-landing/            Sitio generado (HTML estático listo para publicar)
  assets/styles.css        Estilos compartidos
  assets/app.js            Scripts compartidos (generado)
  assets/projects.js       Catálogo de proyectos (se edita a mano)
  assets/img/              Imágenes de proyectos y tarjeta
se-pay-landing-src/        Generador del sitio
  build.py                 Regenera todas las páginas del sitio
  *_body.html              Contenido de cada página
  *.js, *.css              Scripts y estilos que build.py combina
  cloudflare/              Configuración de Cloudflare Pages
    wrangler.toml          Proyecto y almacenamiento KV del formulario
    functions/api/lead.js  Función que guarda los registros del formulario
    exportar_registros.py  Descarga los registros a registros.csv
```

## Regenerar el sitio

```bash
cd se-pay-landing-src
python3 build.py
```

Para agregar o editar un proyecto, modifica `se-pay-landing/assets/projects.js` (no se regenera con `build.py`).

## Publicar en Cloudflare Pages

Desde una carpeta temporal con `wrangler.toml`, `functions/` y el sitio copiado en `public/`:

```bash
npx wrangler pages deploy --branch=main
```

## Registros del formulario

Los registros se guardan en Workers KV (`se-pay-leads`). Para descargarlos:

```bash
cd se-pay-landing-src/cloudflare
python3 exportar_registros.py
```

`registros.csv` contiene datos personales y está excluido del repositorio.

## Aviso

Los proyectos, cifras y actividad que muestra el sitio son ilustrativos. Participar en proyectos tokenizados y en trading de criptoactivos es de alto riesgo.
