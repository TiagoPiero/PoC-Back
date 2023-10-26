function bodyParser(request) {
    return new Promise((resolve, reject) => {
        let totalData = '';
        request
            .on('data',chunk => { // a medida que vayan llegando los datos, se van guardando en una variable totalData
                 totalData += chunk;
            })   
            .on('end', () => {
                request.body = JSON.parse(totalData); //convertir en un objeto (formato json) un string que es lo que el cliente esta enviando y lo gaurdo en el cuerpo del request (propiedad)
                resolve(); //termine la promesa
            })
            .on('error', err => {
                console.log(err);
                reject(); //termina la promesa pero con  un error
            })
    })
}
/* resumidamente, el body parser llega la informacion que el cliente esta enviando. Esta info puede contener datos como no. 
Si contiene datos, vamos a escucharlos y guardarlos en una variable, la que se convierte en un json y lo guardamos en una propiedad body.
En cualquier momento que llame al request.body , accedemos a lo que el cliente ha enviado.-*/

module.exports = { bodyParser }