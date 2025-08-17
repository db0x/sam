# SAM Simple Arc42 Markdown

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

## Dependencies

* docker / docker-compose
* nginx (docker-container)
* marked.js

## Features

* markdown-based optimized for arc42-template
* sections as `include`
* optimized to print from browser

## soon

* includes with more layers 
* direct PlantUML support
* print-support with settings
* ...