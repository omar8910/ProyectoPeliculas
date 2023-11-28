isLoading = false;
isEndOfList = false;
miTimeout = null;

window.onload = () => {
    contenedorOculto = document.getElementsByClassName("contenedorOculto")[0];
    contenidoPeliculas = document.getElementById("contenidoPeliculas");
    btnBuscar = document.getElementById("btnBuscar");
    tipoBusqueda = document.getElementById("tipoBusqueda");
    tipoSeleccionado = "movie";
    inputNombrePelicula = document.getElementById("nombrePelicula"); // Utilizo otro nombre para la variable porque ya existe una variable llamada pelicula y no quiero que se pisen.
    btnValoradas = document.getElementById("btnValoradas");
    btnVotadas = document.getElementById("btnVotadas");
    btnRecaudacion = document.getElementById("btnRecaudacion");

    // Haremos dos botones, uno para buscar haciendo click y otro para buscar con el enter devolviendo
    btnBuscar.addEventListener("click", () => {
        paginaActual = 1;
        buscarPelicula();
    });

    // Mientras escribe el usuario, se va buscando la pelicula, pero solo si tiene mas de 3 caracteres, por cada caracter que se escribe se hace una peticion a la API
    // Si el usuario borra el input, se resetea la busqueda
    inputNombrePelicula.addEventListener("input", () => {
        const searchTerm = inputNombrePelicula.value.trim();
        // Realizar la búsqueda solo si el término de búsqueda tiene al menos 3 caracteres
        if (searchTerm.length >= 3) {
            clearTimeout(miTimeout);
            miTimeout = setTimeout(() => {
                paginaActual = 1;
                buscarPelicula();
            }, 500);
        } else if (searchTerm.length === 0) {
            resetearBusqueda();
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.key == "Enter") {
            paginaActual = 1;
            buscarPelicula();
        }
    });



    // Para cerrar el contenedor de la pelicula al hacer click en el contenedorOculto
    contenedorOculto.addEventListener("click", () => {
        document.getElementsByClassName("contenedorOculto")[0].classList.toggle("ocultarContenedorOculto");
        document.getElementById("contenedor").classList.toggle("oscurecerContenedor");
    });

    // Para cambiar el tipo de busqueda
    tipoBusqueda.addEventListener("change", () => {
        tipoSeleccionado = tipoBusqueda.value;
        resetearBusqueda();
    });

    // Hacer un scroll infinito
    window.addEventListener("scroll", () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement; // Esto se llama destructuring
        if (clientHeight + scrollTop >= scrollHeight - 400) {
            // IsLoading es para que no se hagan peticiones mientras se esta cargando una y isEndOfList es para que no se hagan peticiones cuando no hay mas peliculas.
            if (!isLoading && !isEndOfList && (paginaActual <= (Math.ceil(parseInt(respuesta.totalResults) / 10)))) { 
                // paginaActual tiene la condicion "<=" porque si no, no se cargaria la ultima pagina.
                // Hacemos parseInt(respuesta.totalResults) para convertirlo en un numero y poder hacer la operacion.
                buscarMasPeliculas();
            }
        }

    });
    
}

var tipoSeleccionado;
var contenidoPeliculas;
var paginaActual;
var pelicula;
const apiURL = "https://www.omdbapi.com/?apikey=95286529"; // URL de la API con mi clave


// Función para resetear la búsqueda cuando cambia el tipo de búsqueda
function resetearBusqueda() {
    contenidoPeliculas.innerHTML = "";
    paginaActual = 1;
    if (!isLoading && !isEndOfList) {
        buscarPelicula();
    }
}

// Creamos el objeto httpRequestObject para hacer la peticion a la API
var httpRequestObject = new XMLHttpRequest();

// funcion para iniciar la peticion a la API
function buscarPelicula() {
    pelicula = document.getElementById("nombrePelicula").value;
    httpRequestObject.open("GET", `${apiURL}&type=${tipoSeleccionado}&s=${pelicula}&page=${paginaActual}`, true);
    httpRequestObject.onreadystatechange = mostrarPeliculas;
    httpRequestObject.send();
    paginaActual++;
}

function mostrarPeliculas() {
    // Cambiamos el título del contenedor segun el tipo de busqueda.
    if (tipoSeleccionado === "movie") {
        document.getElementById("tipoH2").innerHTML = "Peliculas";
    } 
    if (tipoSeleccionado === "series") {
        document.getElementById("tipoH2").innerHTML = "Series";
    }

    // Controlamos la respuesta de la API
    if (httpRequestObject.readyState === 4 && httpRequestObject.status === 200) {
        // Si la peticion se ha completado y el estado es 200 (OK) entonces mostramos las peliculas.
        console.log(httpRequestObject.responseText);
        contenidoPeliculas.innerHTML = "";
        respuesta = JSON.parse(httpRequestObject.responseText);
        // Convertimos la variable "respuesta" en un objeto JSON(JSON.parse) para poder acceder a sus propiedades
        // Respuesta tiene propiedades como Response, Search, totalResults. Dentro de Search tenemos las peliculas.
        if (respuesta.Response === "True") {
            document.getElementById("contenedor").style.display = "flex"; // Mostramos el contenedor de las peliculas
            // Si la respuesta es True, entonces mostramos las peliculas
            respuesta.Search.forEach(pelicula => {
                // Creamos un div para cada pelicula
                let divPelicula = document.createElement("div");
                divPelicula.className = "pelicula"
                divPelicula.id = pelicula.imdbID;

                // Creamos un img para cada pelicula
                let imgPelicula = document.createElement("img");
                if (pelicula.Poster === "N/A" || pelicula.Poster === undefined) {
                    imgPelicula.src = "image-not-found.png";
                } else {
                    imgPelicula.src = pelicula.Poster;
                }

                // Creamos un titulo para cada pelicula
                let tituloPelicula = document.createElement("span");
                tituloPelicula.innerHTML = pelicula.Title;

                // Añadimos el img y el titulo al div de la pelicula
                divPelicula.appendChild(imgPelicula);
                divPelicula.appendChild(tituloPelicula);

                // Añadimos el div de la pelicula al contenedor de peliculas
                contenidoPeliculas.appendChild(divPelicula);

                // Creamos un evento para cada pelicula
                divPelicula.addEventListener("click", () => {
                    mostrarDetallesPelicula(pelicula);
                })

            });
        } else {
            tratarErroresDeRespuesta();
        }

    }

}

function buscarMasPeliculas() {
    isLoading = true; // Cuando se esta cargando una peticion, isLoading pasa a ser true para que no se hagan mas peticiones.
    hayMasPeliculas = respuesta.Response === "True";

    if (!hayMasPeliculas && paginaActual == Math.ceil(parseInt(respuesta.totalResults) / 10)) { // Si no hay mas peliculas y estamos en la ultima pagina, isEndOfList pasa a ser true para que no se hagan mas peticiones.
        isEndOfList = true; // Si no hay mas peliculas, isEndOfList pasa a ser true para que no se hagan mas peticiones.
        return;
    }

    httpRequestObject.open("GET", `${apiURL}&type=${tipoSeleccionado}&s=${pelicula}&page=${paginaActual}`, true);
    httpRequestObject.onreadystatechange = () => {
        if (httpRequestObject.readyState === 4 && httpRequestObject.status === 200) {
            mostrarMasPeliculas();
            isLoading = false; // Cuando se ha completado la peticion, isLoading pasa a ser false para poder hacer otra peticion.
        }
    };

    httpRequestObject.send(); // Enviamos la peticion
    paginaActual++;
}

function mostrarMasPeliculas() {
    if (httpRequestObject.readyState === 4 && httpRequestObject.status === 200) {
        console.log(httpRequestObject.responseText);
        respuesta = JSON.parse(httpRequestObject.responseText);
        if (respuesta.Response === "True") {
            respuesta.Search.forEach(pelicula => {
                let divPelicula = document.createElement("div");
                divPelicula.className = "pelicula"

                // Imagen de la pelicula en el contenedor general
                let imgPelicula = document.createElement("img");
                imgPelicula.addEventListener("error", () => {
                    imgPelicula.src = "image-not-found.png";
                });
                if (pelicula.Poster === "N/A") {
                    imgPelicula.src = "image-not-found.png";
                } else {
                    imgPelicula.src = pelicula.Poster;
                }

                let tituloPelicula = document.createElement("span");
                tituloPelicula.innerHTML = pelicula.Title;

                divPelicula.appendChild(imgPelicula);
                divPelicula.appendChild(tituloPelicula);

                contenidoPeliculas.appendChild(divPelicula);

                divPelicula.addEventListener("click", () => {
                    mostrarDetallesPelicula(pelicula);
                });
            });
        }
    }
}



function mostrarDetallesPelicula(pelicula) {
    // funcion para iniciar la peticion a la API
    httpRequestObject.open("GET", `${apiURL}&i=${pelicula.imdbID}`, true);
    httpRequestObject.onreadystatechange = mostrarDetalles;
    httpRequestObject.send();
}

function mostrarDetalles() {
    // Controlamos la respuesta de la API
    if (httpRequestObject.readyState === 4 && httpRequestObject.status === 200) {
        // Si la peticion se ha completado y el estado es 200 (OK) entonces mostramos las peliculas.
        console.log(httpRequestObject.responseText);
        respuesta = JSON.parse(httpRequestObject.responseText);
        // Convertimos la variable "respuesta" en un objeto JSON(JSON.parse) para poder acceder a sus propiedades
        // Respuesta tiene propiedades como Response, Search, totalResults. Dentro de Search tenemos las peliculas.
        if (respuesta.Response === "True") {
            // Si la respuesta es True, entonces mostramos las peliculas
            document.getElementsByClassName("contenedorOculto")[0].classList.toggle("ocultarContenedorOculto");
            document.getElementById("contenedor").classList.toggle("oscurecerContenedor");

            // Imagen de la pelicula en el contenedor oculto
            imagenDetalle = document.getElementById("imagenPelicula");
            imagenDetalle.addEventListener("error", () => {
                imagenDetalle.src = "image-not-found.png";
            });

            if(respuesta.Poster === "N/A" || respuesta.Poster === undefined){
                document.getElementById("imagenPelicula").src = "image-not-found.png";
            } else {
                document.getElementById("imagenPelicula").src = respuesta.Poster;
            }

            // Maquetamos los datos de la pelicula
            document.getElementById("estreno").innerHTML = `Estreno: ${respuesta.Year}`;
            document.getElementById("genero").innerHTML = `Género: ${respuesta.Genre}`;
            document.getElementById("director").innerHTML = `Director: ${respuesta.Director}`;
            document.getElementById("actores").innerHTML = `Actores: ${respuesta.Actors}`;
            document.getElementById("sinopsis").innerHTML = `Sinopsis: ${respuesta.Plot}`;
            document.getElementById("puntuacion").innerHTML = `Valoraciones: `;
            ul = document.createElement("ul");
            document.getElementById("puntuacion").appendChild(ul);
            for(let i = 0; i < respuesta.Ratings.length; i++){
                li = document.createElement("li");
                li.innerHTML = `${respuesta.Ratings[i].Source}: ${respuesta.Ratings[i].Value}`;
                ul.appendChild(li);
            }
        } else {
            tratarErroresDeRespuesta();
        }
        buscarMasPeliculas();
    }
}

function tratarErroresDeRespuesta() {
    // Si la respuesta es False, entonces mostramos un mensaje de error
    document.getElementById("contenedor").style.display = "flex";
    contenidoPeliculas.innerHTML = "";
    let divError = document.createElement("div");
    divError.className = "error";

    if (tipoSeleccionado === "movie") {
        if (respuesta.Error == "Incorrect IMDb ID.") { // Si el error es porque no se ha encontrado la pelicula
            divError.innerHTML = "No se ha encontrado la pelicula";
        } else if (respuesta.Error === "Too many results.") {
            divError.innerHTML = "Se han encontrado demasiadas peliculas, por favor, sea mas especifico";
        } 
        else {
            divError.innerHTML = respuesta.Error;
        }
        contenidoPeliculas.appendChild(divError);
    } else if (tipoSeleccionado === "series") {
        if (respuesta.Error == "Incorrect IMDb ID.") { // Si el error es porque no se ha encontrado la serie
            divError.innerHTML = "No se ha encontrado la serie";
        } else if (respuesta.Error === "Too many results.") {
            divError.innerHTML = "Se han encontrado demasiadas series, por favor, sea mas especifico";
        } else {
            divError.innerHTML = respuesta.Error;
        }
        contenidoPeliculas.appendChild(divError);
    }
}

// No se hacer el grafico ni las tablas, lo dejo comentado para que se vea que lo he intentado.

// function peticionDetallesParaGrafico() {
//     // funcion para iniciar la peticion a la API
//     httpRequestObject.open("GET", `${apiURL}&type=${tipoSeleccionado}&i=${pelicula.imdbID}`, true);
//     httpRequestObject.onreadystatechange = mostrarDetallesParaGrafico;
//     httpRequestObject.send();
// }



