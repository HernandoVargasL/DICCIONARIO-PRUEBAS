
var currentUser;
var firebase_ui;

var tableSearchTerminos;
var letraArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

//var web_service = "http://localhost:8080/Geovisor_IGAC";
var web_service = "https://serviciosgeovisor.igac.gov.co:8080/Geovisor";
//var web_service = "http://172.19.3.37:8080/Geovisor";


$(document).ready(function () {    
    var config = {
        apiKey: "AIzaSyCLSp_Qbaohj8owxrpZxvrmxUSkVw0ukig",
        authDomain: "geovisor-igac.firebaseapp.com"
    };
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            currentUser = user;
            $("#loginContainer").hide();
            $("#logoutContainer").show();
            $("#userName,#userName2").html(user.displayName);
            if (user.photoURL != null) {
                if (user.photoURL != "") {
                    $("#userPhoto,#userPhoto2").attr("src", user.photoURL);
                } else {
                    $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
                }
            } else {
                $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
            }
        } else {
            currentUser = null;
            $("#logoutContainer").hide();
            $("#loginContainer").show();
            $("#userName,#userName2").html("Iniciar sesion");
            $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
        }
    }, function (error) {
        console.log(error);
    });
    firebase_ui = new firebaseui.auth.AuthUI(firebase.auth());
    signIn();
    
    $.fn.DataTable.ext.pager.numbers_length = 200;
    tableSearchTerminos = $("#tableSearchTerminos").DataTable({
        dom: '<"top"<"clear">>rt<"bottom"<"clear">>',
        lengthMenu: [[200], ["Todos los registros"]],
        language: spanishDataTable,
        processing: true,
        serverSide: false,
        ajax: {
            url: web_service + "/diccionario",
            deferLoading: 0,
            data: function (d) {
                d.cmd = "query_terminos";
                d.t = (new Date()).getTime()
            },
            dataSrc: function (dataRow) {
                return dataRow.TERMINOS;
            }
        },
        columns: [
            {
                data: "ID_TERMINO",
                render: function (data, type, row, meta) {
                    return "<a href='/?tipo=" + row.NOMBRE + "'>" + row.NOMBRE + "</a>";
                }
            },
            {
                data: "ID_TERMINO",
                render: function (data, type, row, meta) {
                    if (row.CAMPO_APLICACION == null) {
                        return "";
                    }
                    return row.CAMPO_APLICACION;
                }
            },
            {
                data: "ID_TERMINO",
                sortable: false,
                render: function (data, type, row, meta) {
                    if (row.DEFINICION == null) {
                        return "";
                    }
                    return "<span style='text-align: left;'>" + row.DEFINICION + "</span>";
                }
            },
            {
                data: "ID_TERMINO",
                render: function (data, type, row, meta) {
                    if (row.FUENTE == null) {
                        return "";
                    }
                    var strHTML = "";
                    try {
                        var fuentes = JSON.parse(row.FUENTE);
                        for (var i = 0; i < fuentes.length; i++) {
                            if (findFuenteById(fuentes[i]) != null) {
                                if (strHTML.length > 0) {
                                    strHTML = strHTML + "<br/>";
                                }
                                strHTML = strHTML + findFuenteById(fuentes[i]).text;
                            }
                        }
                    } catch (err) {
                        return "";
                    }
                    return strHTML;
                }
            },
        ]
    });
});

function filtro(letter) {
    if (letter == null) {
        tableSearchTerminos.column(0).search("", true, false).draw();
        return;
    }
    tableSearchTerminos.column(0).search("^" + letter, true, true).draw();
}

function defaultUserPhoto() {
    $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
}

function signIn() {
    $("#logoutContainer").hide();
    $("#loginContainer").show();

    var uiConfig = {
        callbacks: {
            signInSuccess: function (_currentUser, _credential, _redirectUrl) {
                closeLogin();
                return false;
            }
        },
        signInOptions: [{
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes: [
                'https://www.googleapis.com/auth/plus.login'
            ],
            customParameters: {
                prompt: 'select_account'
            }
        },
        {
            provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            scopes: [
                'public_profile',
                'email'
            ],
            customParameters: {
                auth_type: 'reauthenticate'
            }
        },
            'apple.com',
            'microsoft.com',
            'yahoo.com',
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        signInFlow: "popup"
    };

    firebase_ui.start('#authContainer', uiConfig);
}

function signOut() {
    firebase.auth().signOut();
    $("#logoutContainer").hide();
    $("#loginContainer").show();
    currentUser = null;
    closeLogin();
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return null;
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

window.Clipboard = (function (window, document, navigator) {
    var textArea,
        copy;

    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.value = text;
        document.body.appendChild(textArea);
    }

    function selectText() {
        var range,
            selection;

        if (isOS()) {
            range = document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }

    function copyToClipboard() {
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    copy = function (text) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };

    return {
        copy: copy
    };
})(window, document, navigator);


function getSorted(selector, attrName) {
    return $($(selector).toArray().sort(function (a, b) {
        var aVal = a.getAttribute(attrName),
            bVal = b.getAttribute(attrName);
        return (aVal > bVal) ? 1 : -1;
    }));
}

var spanishDataTable = {
    "sProcessing": "Procesando...",
    "sLengthMenu": "_MENU_",
    "sZeroRecords": "No se encontraron resultados",
    "sEmptyTable": "Ningún dato disponible en esta tabla",
    "sInfo": "_START_ - _END_ de _TOTAL_ resultados",
    "sInfoEmpty": "No hay resultados",
    "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
    "sInfoPostFix": "",
    "sSearch": "Buscar:",
    "sUrl": "",
    "sInfoThousands": ",",
    "sLoadingRecords": "Cargando...",
    "oPaginate": {
        "sFirst": "Primero",
        "sLast": "Último",
        "sNext": "Siguiente",
        "sPrevious": "Anterior"
    },
    "oAria": {
        "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
        "sSortDescending": ": Activar para ordenar la columna de manera descendente"
    }
}

function limpiarTexto(str) {
    return accentFold(str.toLowerCase());
}

function accentFold(inStr) {
    return inStr.replace(
        /([àáâãäå])|([çčć])|([èéêë])|([ìíîï])|([ñ])|([òóôõöø])|([ß])|([ùúûü])|([ÿ])|([æ])/g,
        function (str, a, c, e, i, n, o, s, u, y, ae) {
            if (a) return 'a';
            if (c) return 'c';
            if (e) return 'e';
            if (i) return 'i';
            if (n) return 'n';
            if (o) return 'o';
            if (s) return 's';
            if (u) return 'u';
            if (y) return 'y';
            if (ae) return 'ae';
        }
    );
}

var fuentes = [{ "id": 1, "text": "Dávila Burga, J. (2011). DICCIONARIO GEOLÓGICO (Art Grouti). INGEMMET. " },
{ "id": 2, "text": "IDEAM. (1999). Orografía y Geología del Área del Macizo Colombiano. In El Macizo Colombiano y su área de influencia (p. 189). " },
{ "id": 3, "text": "IDEAM. (2010). La Montaña Baja (MB). In Sistemas Morfogénicos del Territorio Colombiano (p. 245). Instituto de Hidrología, Meteorología y Estudios Ambientales. http://documentacion.ideam.gov.co/openbiblio/bvirtual/021769/Sistemas_Morf_Territ_Col_Ideam_Cap4.pdf " },
{ "id": 4, "text": "IGAC. (1992). Léxico de términos geográficos. Instituto Geográfico Agustín Codazzi. " },
{ "id": 5, "text": "IGAC. (1996). Diccionario Geográfico de Colombia (Banco de la República (ed.)). Instituto Geográfico Agustín Codazzi. " },
{ "id": 6, "text": "IGAC. (1998). Diccionario de topónimos y términos costeros de Colombia. Instituto Geográfico Agustín Codazzi. " },
{ "id": 7, "text": "IGM Ecuador. (2007). Diccionario de términos geográficos. Instituto Geográfico Militar del Ecuador. " },
{ "id": 8, "text": "IGN. (2020). Glosario de términos geográficos. Grupo de Didáctica de La Geografía de La Asociación Española de Geografía (AGE), Instituto Geográfico Nacional. https://www.ign.es/web/ign/portal/recursos-educativos/glosario-IGN-AGE " },
{ "id": 9, "text": "Inter American Geodetic Survey. (1952). Definiciones de Términos Topográficos. " },
{ "id": 10, "text": "ECOVIDA. (2015). Diccionario Nombres Geográficos Pinar del Río. Ediciones Loynaz. Centro de Investigaciones y Servicios Ambientales." },
{ "id": 11, "text": "IPGH. (1978b). Especificaciones para Mapas Topográficos. Instituto Panamericano de Geografía e Historia. " },
{ "id": 12, "text": "" },
{ "id": 13, "text": "Pilar, M., Rodríguez, G., Casado, E., José, M.-A., García, M., Antonio, A., Guerra, M., Ángel, Z., Madrid, N., Manuela, M., García, R., Sánchez Pérez De Évora, A., José, J., & Donaire, S. (2018). Glosario de Geografía Directora del proyecto Equipo redactor. " },
{ "id": 14, "text": "RAE. (2020). Diccionario de la Lengua Española. 23.a ed. Real Academia Española. https://dle.rae.es " },
{ "id": 15, "text": "UNGEGN. (2002). Glossary of Terms for the Standardization of Geographical Names. In United Nations Group of Experts on Geographical Names. Department of Economic and Social Affairs, Statistics Division. " },
{ "id": 16, "text": "Villota, H. (2005). Geomorfología aplicada a levantamientos edafológicos y zonificación física de tierras. Instituto Geográfico Agustín Codazzi. " },
{ "id": 17, "text": "Yépez, V., Garcés W. (1984). Curso Básico de Topografía, Publicación Departamento de Programación y Evaluación del M.A.G." },
{ "id": 18, "text": "Ediciones Rioduero (1974) Diccionario Rioduero de Geografía." },
{ "id": 19, "text": "IDEAM, Universidad Nacional de Colombia (1997). Geosistemas de la alta montaña. Bogotá" },
{ "id": 20, "text": "Longman Group Limited. (1981). A Glossay of Geographical Terms. New York" },
{ "id": 21, "text": "DANE. (2018).  Manual de Conceptos. Censo Nacional de Población y Vivienda. Colombia" },
{ "id": 22, "text": "Congreso de la República de Colombia. (1993) Ley 70. Por la cual se desarrolla el artículo transitorio 55 de la Constitución Política." },
{ "id": 23, "text": "Congreso de la República de Colombia. (2021) Ley Orgánica 2082. Por medio de la cual se crea la categoría municipal de ciudades capitales, se adoptan mecanismos tendientes a fortalecer la descentralización administrativa y se dictan otras disposiciones." },
{ "id": 24, "text": "Congreso de la República de Colombia. (2013) Ley 1617. Por la cual se expide el Régimen para los Distritos Especiales." },
{ "id": 25, "text": "Presidencia de la República de Colombia (2010) Decreto 2372. Por el cual se reglamenta el Decreto Ley 2811 de 1974, la Ley 99 de 1993, la Ley 165 de 1994 y el Decreto Ley 216 de 2003, en relación con el Sistema Nacional de Áreas Protegidas, las categorías de manejo que lo conforman y se dictan otras disposiciones." },
{ "id": 26, "text": "Presidencia de la República de Colombia (1974) Decreto 2811. Por el cual se dicta el Código Nacional de Recursos Naturales Renovables y de Protección al Medio Ambiente." },
{ "id": 27, "text": "Presidencia de la República de Colombia (1999) Decreto 1996. Por el cual se reglamentan los artículos 109 y 110 de la Ley 99 de 1993 sobre Reservas Naturales de la Sociedad Civil. Artículo 1." },
{ "id": 28, "text": "Constitución Política de Colombia (1991)." },
{ "id": 29, "text": "Medellín, Paola;  Zea, Ana Isabel Zea. (2018). ¿Qué son y para qué existen los distritos en Colombia?: Instituto de Estudios Urbanos - IEU. http://ieu.unal.edu.co/en/medios/noticias-del-ieu/item/que-son-y-para-que-existen-los-distritos-en-colombia" },
{ "id": 30, "text": "Congreso de la República de Colombia. (2007). Acto Legislativo 2. Por medio del cual se modifican los artículos 328 y 356 de la Constitución Política de Colombia. Diario Oficial No. 46.681 de 6 de julio de 2007." },
{ "id": 31, "text": "Congreso de la República de Colombia. (1993). Acto Legislativo 1. Por medio del cual se erige a la ciudad de Barranquilla, Capital del Departamento del Atlántico, en Distrito Especial, Industrial y Portuario. Diario Oficial No. 40.995 de 18 de agosto de 1993." },
{ "id": 32, "text": "Rico Gómez, Lina del Pilar. (2007) Formulación de un Documento Base de Caracterización de la Función Ambiental, de Siete Humedales De Colombia; Como Insumo para la Actualización de la Política Nacional de Humedales Interiores. Facultad de ingeniería Ambiental y Sanitaria. Universidad de La Salle" },
{ "id": 33, "text": "Banco de Occidente (2018). Ecolibro Colombia Naturaleza en Riesgo. https://comunidadplanetaazul.com/las-cienagas/" },
{ "id": 34, "text": "Presidencia de la República. (1995) Decreto 2164. Por el cual se reglamenta parcialmente el Capítulo XIV de la Ley 160 de 1994 en lo relacionado con la dotación y titulación de tierras a las comunidades indígenas para la constitución, reestructuración, ampliación y saneamiento de los Resguardos Indígenas en el territorio nacional." },
{ "id": 35, "text": "UAEAC. (2020). Reglamentos Aeronáuticos de Colombia - RAC 14 Aeródromos, Aeropuertos y Helipuertos. Unidad Administrativa Especial de Aeronáutica Civil." },
{ "id": 36, "text": "Congreso de la República de Colombia. (2018). Ley 1930. Por medio de la cual se dictan disposiciones para la gestión integral de los páramos en Colombia" },
{ "id": 37, "text": "INVIAS. (2015). Norma Colombiana de Diseño de Puentes (CCP-14)" },
{ "id": 38, "text": "Ministerio de Transporte. (2013). Concepto jurídico. http://web.mintransporte.gov.co/jspui/handle/001/2114" },
{ "id": 39, "text": "Secretaría de Energía.(2012). Centrales Eléctricas. República Argentina. " },
{ "id": 40, "text": "Daza Martínez, Blanca & Tobar Vargas, Luisa. (2006). Los niños indígenas Wayúu del desierto: cultura y situación En: Mincultura. (2016), Caracterizaciones de los pueblos indígenas de Colombia. Dirección de Poblaciones. https://www.mincultura.gov.co/prensa/noticias/Documents/Poblaciones/PUEBLO%20WAY%C3%9AU.pdf alimentaria. Pontificia Universidad Javeriana" },
{ "id": 41, "text": "" },
{ "id": 42, "text": "Duque, Ocampo. (2015). Cartilla áreas protegidas en Colombia. Fundación para la Conservación y el Desarrollo Sostenible. USAID." },
{ "id": 43, "text": "ICANH, Instituto colombiano de antropología e historia (2021). https://www.icanh.gov.co/grupos_investigacion/arqueologia/parques_asociados/parques_arqueologicos_nacionales/Areas_arqueologicas_protegidas" },
{ "id": 44, "text": "IALA - AISM. (2014). Guía de Navegación: Manual de Ayudas a la Navegación. Séptima edición. Asociación Internacional de Autoridades de Señalización Marítima y Ayudas a la Navegación." },
{ "id": 45, "text": "Congreso de la República. (1991). Ley 1. or la cual se expide el Estatuto de Puertos Marítimos y se dictan otras disposiciones. Enero 10." },
{ "id": 46, "text": "" }
];

function findFuenteById(id) {
    for (var i = 0; fuentes.length; i++) {
        if (fuentes[i].id == id) {
            return fuentes[i];
        }
    }
    return null;
}

