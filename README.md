You will need the following things downloaded to run the code 
  1. Vite
  2. ThreeJS
  3. Node JS
  4. Dat Gui


# Node Js

  # installs fnm (Fast Node Manager)
  winget install Schniz.fnm

  # configure fnm environment
  fnm env --use-on-cd | Out-String | Invoke-Expression

  # download and install Node.js
  fnm use --install-if-missing 20

  # verifies the right Node.js version is in the environment
  node -v # should print `v20.18.0`

  # verifies the right npm version is in the environment
  npm -v # should print `10.8.2`

# ThreeJs 
npm install --save three


# Vite
npm install --save-dev vite

# To run Vite: 
In terminal: npx vite 



