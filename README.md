# sam simple-arc42-markdown

``` 
       _            __                     ____ ___ 
  ___ (_)_ _  ___  / /__ _______ _________/ / /|_  |
 (_-</ /  ' \/ _ \/ / -_)___/ _ `/ __/ __/_  _/ __/ 
/___/_/_/_/_/ .__/_/\__/  __\_,_/_/  \__/ /_//____/ 
  __ _  ___/_/___/ /_____/ /__ _    _____           
 /  ' \/ _ `/ __/  '_/ _  / _ \ |/|/ / _ \          
/_/_/_/\_,_/_/ /_/\_\\_,_/\___/__,__/_//_/          
                                                    
```                                          
* _One-click_ solution for providing markdown documentation as HTML in a docker-container nginx based.
* Optimized for creating `arc42`-based documentation.
* `include` feature to get better structure of your documentation.
* `include` automatic rendered plantUML diagrams into your document.
* Improved printing to PDF and paper.
* Download ziped static documentation.
* Automatic handling of glossary.

## Get started

```bash
# get the code

git clone https://github.com/db0x/sam.git
```

### Start the docker-container

```bash
cd sam 
docker-compose up -d
```

### Open documentation in browser

Two examples of documentation are enclosed.

- [arc42-template on localhost](http://localhost:8080?content=arc42-template)
- [empty documentation on localhost](http://localhost:8080?content=arc42-template)

The associated .md files and configurations are located under `/content`.

## Features & configuration

### Include .md

With `sam`, it is possible to embed other Markdown documents into the main document (currently only one level deep).

example:
* include of all content from `/content/01-Introduction_and_Goals.md` to this place.

```md
![](01-Introduction_and_Goals.md) 
```
This feature is always active and does not need to be configured.

### Include .wsd (plantUML code)

With `sam`, it is possible to embed plantUML code directly into the main document.
The plantUML diagram will be rendered and embedded as an `svg` in the html.

example:
* include rendered svg of `/content/assets/plantUML/06-example.wsd` to this place.

```md
![](assets/plantUML/06-example.wsd)
```
#### Configuration 

```json
    "plantUML": {
        "active": true,
        "server":"/_plantuml/svg"
    }
```
`plantUML.active` = true -> enables the feature\
`plantUML.server` = "/_plantuml/svg" -> endpoint to render plantUML to svg. default usage of a local docker-container. If you need an external server, this can be changed in this place. Our recommendation is to always use the local server, which is offered as the default, whenever possible to prevent data leakage.

### Auto-glossary 

With `sam`, it is possible to create a glossary from the documentation. To do this, you must specify the term and description in a specific syntax (once) in the text. The term is then automatically added to the glossary at the end of arc42.

example:
* Adds the term `server` to the glossary with the description in `{}` direct after the term. The term self will be replaced with a link to the glossary.

```md
This is a longer text about `server`{In software architecture,
a server is a system or component that provides services, data,
or functionality to other components (clients) over a network.
It typically manages requests, processes them,
and returns responses according to a defined protocol.} and 
what you can do with them.
```

syntax:
```
`term`{description}
```

The occurrence of the term is replaced in the text by a link to the term in the glossary, and the description in the glossary is taken over by curly brackets.

#### Configuration 

```json
{
    "autoGlossary": {
        "active": true,
        "strict": true
    },
}
```
`autoGlossary.active` = true -> enables the feature\
`autoGlossary.strict` = true -> replace **all** matches of term in the document with a link to the glossary

### Embed SVGs 

SVGs embedded directly in HTML have the advantage that you can search within the content of the graphics (including in PDFs). However, this requires the SVGs to be embedded directly. If this feature is enabled, all SVGs are searched for and embedded. The maximum width is also calculated for each graphic to ensure that it does not extend beyond the print area.

#### Configuration 

```json
{
    "embedSVG":true
}
```
`embedSVG` = true -> enables the feature\

### Optimized to print from browser

Its core function is to provide arc42 architecture documentation that can be easily printed in PDF or on paper.

* automatic printing of page numbers
* handling of toc
* adjustable page breaks

## Dependencies

* docker / docker-compose
* [nginx](https://nginx.org/)
* [plantUML](https://plantuml.com/)
* [puppeteer](https://pptr.dev/)
* [marked.js](https://github.com/markedjs/marked)
* [highlightjs](https://highlightjs.org/)
* [papirus icon theme](https://github.com/PapirusDevelopmentTeam/papirus-icon-theme)

