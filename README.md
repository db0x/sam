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
* _One-click_ solution for providing markdown documentation as HTML. (`docker`-container)
* Optimized for creating `arc42`-based documentation.
* `include` feature to get better structure of your documentation.
* Improved printing to PDF and paper.

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

[documentation on localhost](http://localhost:8080)

## Features & configuration

### Include .md

With `sam`, it is possible to embed other Markdown documents into the main document (currently only one level deep).

example:
* include of all content from `/content/01-Introduction_and_Goals.md` to this place.

```md
![](/content/01-Introduction_and_Goals.md) 
```
This feature is always active and does not need to be configured.

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

### Optimized to print from browser

Its core function is to provide arc42 architecture documentation that can be easily printed in PDF or on paper.
* automatic printing of page numbers
* handling of toc
* adjustable page breaks

## Dependencies

* docker / docker-compose
* nginx (docker-container)
* marked.js


## Soon ....

* includes with more layers 
* direct PlantUML support
* print-support with settings

