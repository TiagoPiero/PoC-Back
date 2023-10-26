const http = require('http');
const { bodyParser } = require('./lib/bodyParser')    // se desestructura con el  -const { bodyParser}- ya que en el archivo se exporta un objeto con una funcion dentro. Por lo tanto acá importamos solamente la funcion-
const cors = require("cors"); // Importa el paquete cors

let database = [{
    "title": "Task One"
},
{
    "title": "Task Two"
},
{
    "title": "Task Three"
}];

// Configura cors
const corsOptions = {
    origin: "*", // Reemplaza con el origen de tu cliente
    methods: "GET, POST, PUT, DELETE",
    optionsSuccessStatus: 204,
  };

const corsMiddleware = cors(corsOptions);


// creo esta funcion para que no tener que copiar el mismo codigo varias veces. Es lo que iria dentro de -get /tasks-   "manejador de contestador de tareas"
function getTaskHandler(req, res) {       
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(JSON.stringify(database)); 
    res.end();
}

// lo  mismo para el post. Usamos postman para verificar las peticiones ya que si no tendriamos que tener la app web desde la que el cliente envía las peticiones GPPD
async function createTaskHandler(req, res) {     "manejador de creador de tareas"
    try {
        await bodyParser(req)  // el await es pq como el body parser tiene que analizar lo que el usuario envió, esto lleva un tiempo. Se coloca tambien el async al comienzo de la funcion
        database.push(req.body) //guardamos en la base de datos el objeto recibido (Seria la respuesta si todo sale bien. Por eso usamos el try catch para controlar si sale bien o no la peticion)
        console.log(req.body);
        
        res.writeHead(200, {'Content-Type': 'application/json'});// el archivo que mandamos es json
        res.write(JSON.stringify(database)); 
        res.end();
    } catch (error) {   // si ocurre algun error envio una respuesta al cliente con un mensaje de texto.
        res.writeHead(200, {'Content-Type': 'text/plain'});// el archivo que mandamos es json
        res.write('Datos invalidos'); 
        res.end();
    }

}

async function updateTasksHandler(req,res) {  //"manejador de creador de tareas" // el update en vez de hacerlo con clave primaria lo hacemos aca mediante el indice. Se hace especificando en la url /tasks?id=2 (indice 2)
    try {
        let {url} = req;

        //se divide la url para obtener la clave y el indice, y se guarda en las variables respectivas
        let idQuery = url.split("?") [1]; // 'id=2-'
        let idKey = idQuery.split("=") [0]; // divido al idQuery para obtener la clave y el indice
        let idValue= idQuery.split("=") [1]; // idKey = id ; idValue = 2
        
        if(idKey === "id") {
            await bodyParser(req);

            database[idValue - 1] = req.body;
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(database)); 
            res.end();
        } else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('Invalid request query'); 
            res.end();
        }


    } catch (error) {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.write('Invalid Body Data was provided', error.message); 
        res.end();
    }
}

async function deleteTasksHandler(req,res) {        //"manejador de eliminador de tareas" 
    let { url } = req;

    let idQuery = url.split("?") [1]; // 'id=2-'
    let idKey = idQuery.split("=") [0]; // divido al idQuery para obtener la clave y el indice
    let idValue= idQuery.split("=") [1]; // idKey = id ; idValue = 2
   
    if (idKey === 'id') {
        database.splice(idValue - 1, 1) //elimino de la base de datos el elemento indicado en el indice. Luego indico cuantos elementos elimino.
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('DELETE succesfully'); 
        res.end();
    }
    else {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.write('Invalid Query'); 
        res.end();
    }
}


const server = http.createServer((req, res) => {

    const { url, method} = req;

    /*GET, POST, PUT, DELETE son los metodos mas utilizados de http.
      GET /             el usuario pide algo a la ruta inicial
      GET /tasks        pide las tareas que tengo en el servidor
      POST /products    crear algun producto
      PUT /tasks        actualizar una tarea*/

    // Logger
    console.log(`URL: ${url} - Method: ${method}`)

    // cabecera: informacion extra de la respuesta. 
    //res.writeHead(200, {'Content-Type': 'text/plain'})// esta cabecera la hacemos para especificar que archivo le estamos enviamos al cliente
    //res.write('Received');  //contenido del texto
    //res.end();

    corsMiddleware(req, res, () => {
        // Router
        switch (method) {
          case "GET":
            if (url === "/") {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.write(JSON.stringify({ message: "Hello World" }));
              res.end();
            }
            if (url === "/tasks") {
                getTaskHandler(req, res);
            }
            break;
          case "POST":
            if (url === "/tasks") {
              createTaskHandler(req, res);
            }
            break;
          case "PUT":
            updateTasksHandler(req, res);
            break;
          case "DELETE":
            deleteTasksHandler(req, res);
            break;
          default:
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.write("404 Not Found");
            res.end();
        }
      });

})

server.listen(3000);
console.log('Server on port',3000);