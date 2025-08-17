# SAM Simple Arc42 Markdown

```ascii
   _______   __  ___                                                                             
  / __/ _ | /  |/  /                                                                             
 _\ \/ __ |/ /|_/ /                                                                              
/___/_/_|_/_/  /_/  __        ___           ____ ___     __  ___         __      __              
  / __(_)_ _  ___  / /__ ____/ _ | ________/ / /|_  |___/  |/  /__ _____/ /_____/ /__ _    _____ 
 _\ \/ /  ' \/ _ \/ / -_)___/ __ |/ __/ __/_  _/ __/___/ /|_/ / _ `/ __/  '_/ _  / _ \ |/|/ / _ \
/___/_/_/_/_/ .__/_/\__/   /_/ |_/_/  \__/ /_//____/  /_/  /_/\_,_/_/ /_/\_\\_,_/\___/__,__/_//_/
           /_/                                                                                   

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