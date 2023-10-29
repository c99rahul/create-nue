
/*
  Generates a sample HTML page using Nue server-side rendering

  https://nuejs.org/docs/nuejs/server-components.html
*/

import { parse, render, renderFile } from 'nuejs-core'
import { promises as fs } from 'node:fs'
import yaml from 'js-yaml'

export default async function () {
  // read() function for reading assets
  const read = async (name, dir='src') => await fs.readFile(dir + '/' + name, 'utf-8')
  
  // read primary CSS
  const primary_css = await read('primary.css', 'www/css')
  
  // read dependencies (server-side components)
  const lib  = parse(await read('components.nue'))
  
  // read website data: title, description, etc.
  const data = yaml.load(await read('content.data'))
  
  // read page layout
  const page = await read('layout.nue')
  const page404 = await read('404.nue')
  
  // set extra, dynamic properties to data
  data.primary_css = primary_css.replace(/\s+/g, ' ')
  data.timestamp = new Date()
  
  // generate HTML with the render() method
  const prefix = '<!DOCTYPE html>\n\n';
  const html = prefix + render(page, data, lib)
  const html404 = prefix + render(page404, data, lib)
  
  // write index.html & 404.html
  await fs.writeFile('./www/index.html', html)
  await fs.writeFile('./www/404.html', html404)
  console.log('wrote', 'www/index.html, www/404.html')

  // grab the logo.nue markup to demo a server component
  let logoComponentHtml = await renderServerComponent(
    './src/components/logo.nue',
    {
      href: '#',
      img_src: 'img/logo.svg',
    }
  )

  // log the logo.nue markup in the server component
  console.log(logoComponentHtml)
}

async function renderServerComponent(url, ops) {
  try {
    // Render the product card component with some product data
    const serverComponentHtml = await renderFile(url, ops)
    return serverComponentHtml
  } catch (error) {
    console.error(error)
    return '' // or handle the error as needed
  }
}
