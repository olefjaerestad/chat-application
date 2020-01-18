# chat-application

A chat application built using node.js, WebSockets, TypeScript and webpack. The app consists of a Node.js server and a frontend.

## Get started

To start building, run the following commands:

1. `$ npm i`
This installs all project dependencies. This only needs to be ran once, so if you've already installed the dependencies (there's a node_modules folder in your project root), you can skip to next step.
2. `$ npm run startserver`
This boots up the Node.js server, which uses Websocket to communicate with the clients.
3. `$ IP=192.168.1.242 npm run startui`
This spins up a local development server for the client side. Remember to replace the IP address with your own IP if you want to access the ui from another device on your network (will be available at {yourIP}:9000). If you don't need that opportunity, you can simply run `$ npm run startui`.

To create a production build, run the following commands:

1. `$ npm i`
This installs all project dependencies. This only needs to be ran once, so if you've already installed the dependencies (there's a node_modules folder in your project root), you can skip to next step.
2. `$ IP=192.168.1.242 npm run build`
This creates a production ready `/dist` folder containing the code for the client side. Remember to replace the IP address with the IP where the server code (see step 3) will run. Note: The `/dist` folder is gitignored.
3. `$ npm run startserver`
This command has to be run (and kept running) wherever the server code should be run. It could be your local machine, it could be some other server/machine/cloud. It boots up the Node.js server, which uses Websocket to communicate with the clients.