var currentUser;
var firebase_ui;

var currentScreen;
var currentLetter;
var currentTermino;
var currentTerminoDetail;
var currentTerminoSearch;
var currentUnidadSearch;
var currentTipoSearch;
var currentLetterSearch;
var currentCaracterizacion;
var currentToponimo;
var audio1;
var audio2;

var cacheUnidadesFiltro = [];
var cacheTipoFiltro = [];
var default_extent;
var prevScreen;
var firstParameters = true;
var tableSearchLetter;
var tableSearchTermino;
var counterFilter = 0;
var isTarjeta = false;
var cacheTerminos;
var currentDraw = 0;

var modoET;
var modoNG;
var modoTG;
var modoET2;

var listResultsUnidadHeader;
var terminoResultsUnidadHeader;
var ngAddMap;
var redMarker;
var default_extent;
var glPoint;
var loading;

var locateBtn;
var homeBtn;
var scalebar;
var locateBtn1;
var homeBtn1;
var scalebar1;

var letraArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "Ñ", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

//var web_service = "http://localhost:8080/Geovisor_IGAC";
var web_service = "https://serviciosgeovisor.igac.gov.co:8080/Geovisor";
//var web_service = "http://172.19.3.37:8080/Geovisor";
var thumbnail_geodesia_service = "https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/export?";


$(document).ready(function () {
    /*
    window.onpopstate = function (event) {
        console.log(event.state);
        gotoState(event.state);
    }
    */
    initMap();
    $("#panelSearch").show();
    $("[data-toggle='popover']").popover();
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
                    $("#userPhoto,#userPhoto2").attr("src", "./images/iconos/User.png");
                }
            } else {
                $("#userPhoto,#userPhoto2").attr("src", "./images/iconos/User.png");
            }
        } else {
            currentUser = null;
            $("#logoutContainer").hide();
            $("#loginContainer").show();
            $("#userName,#userName2").html("Iniciar sesion");
            $("#userPhoto,#userPhoto2").attr("src", "./images/iconos/User.png");
        }
    }, function (error) {
        console.log(error);
    });
    firebase_ui = new firebaseui.auth.AuthUI(firebase.auth());
    signIn();
    $('[data-toggle="tooltip"]').tooltip();
    $.fn.DataTable.ext.pager.numbers_length = 10;
    $(".shareLink").tooltip({
        container: "body",
        template: '<div class="tooltipX" role="tooltip"><div class="tooltip-arrowX"></div><div class="tooltip-innerX">Click para copiar el Link</div></div>'
    });
    $(".shareLink").on("shown.bs.tooltip", function () {
        $(".tooltip-arrowX").css("border-right-color", "#3168E4");
        $(".tooltip-innerX").css("background-color", "#3168E4");
        $(".tooltip-innerX").html("Click para copiar el Link");
    });
    var params = "";
    $.ajax({
        url: web_service + "/config?cmd=config_diccionario&t=" + (new Date()).getTime() + params,
        type: 'POST',
        success: function (data) {
            if (data.status) {
                initData(data);
            }
        },
        timeout: 20000,
        error: function (err) {

        }
    });

    $("#inputSearch").on("input", function (e) {
        updateResultados();
    });
    $("#filtrosBarLimpiar").on("click", function () {
        limpiarFiltros();
    });

    $("#ngaddImage").on("change", function () {
        var file = this.files[0];
        if (file) {
            var fileSize = (file.size / 1024).toFixed(2);
            $("#ngaddInfo").html("Archivo: " + file.name + ", Tamaño: " + fileSize + " Kb.");
            $("#ngaddInfo").show();
        }
    });
    $("#ngaddCoordenada").on("change", function (e) {
        $("#ngaddX").attr("placeholder", sistemasCoordenadas[$("#ngaddCoordenada").val()].labLat);
        $("#ngaddY").attr("placeholder", sistemasCoordenadas[$("#ngaddCoordenada").val()].labLng);
        var from = sistemasCoordenadas["EPSG:3857"].proj;
        var to = sistemasCoordenadas[$("#ngaddCoordenada").val()].proj;
        var reprojectedCoordsNew = proj4(from, to, [ngAddMap.extent.getCenter().x, ngAddMap.extent.getCenter().y]);
        $("#ngaddX").val(reprojectedCoordsNew[1]);
        $("#ngaddY").val(reprojectedCoordsNew[0]);
    });

    $("#basemapGalleryButton").on("click", function () {
        $("#basemapGalleryButton").popover("show");
    });
    $("#basemapGalleryButton1").on("click", function () {
        $("#basemapGalleryButton1").popover("show");
    });

});

function gotoState(state) {
    if (state == null) {
        window.document.title = "Diccionario Geográfico de Colombia";
        minAll();
        $("#homeDiv").show();
        $("html, body").animate({ scrollTop: 0 });
        $("#searchFiltro").val(null);
        $("#searchFiltro").trigger("change.select2");
        $("#searchFiltroTipo").val(null);
        $("#searchFiltroTipo").trigger("change.select2");
        $("#searchFiltroLetra").val(null);
        $("#searchFiltroLetra").trigger("change.select2");
        return;
    }
    console.log(state);
    if (state.searchFiltro == null) {
        $("#searchFiltro").val(null);
        $("#searchFiltro").trigger("change.select2");
    } else {
        $("#searchFiltro").val(state.searchFiltro);
        $("#searchFiltro").trigger("change.select2");
    }
    if (state.searchFiltroTipo == null) {
        $("#searchFiltroTipo").val(null);
        $("#searchFiltroTipo").trigger("change.select2");
    } else {
        if (state.searchFiltroTipo.length == 0) {
            $("#searchFiltroTipo").val(null);
            $("#searchFiltroTipo").trigger("change.select2");
        } else {
            $("#searchFiltroTipo").val(state.searchFiltroTipo);
            $("#searchFiltroTipo").trigger("change.select2");
            updateTags();
        }
    }
    if (state.searchFiltroLetra == null) {
        $("#searchFiltroLetra").val(null);
        $("#searchFiltroLetra").trigger("change.select2");
    } else {
        $("#searchFiltroLetra").val(state.searchFiltroLetra);
        $("#searchFiltroLetra").trigger("change.select2");
    }
    if (state.currentTerminoSearch == null) {
        $(".searchCtrl2").val(null);
    } else {
        $(".searchCtrl2").val(state.currentTerminoSearch);
    }
    if (state.screen == "homeDiv") {
        minAll();
        $("#homeDiv").show();
        $("html, body").animate({ scrollTop: 0 });
    }
    if (state.screen == "searchDiv") {
        updateFiltros();
        gotoTerminoSearch();
    }
    if (state.screen == "letterDiv") {
        updateSearch();
    }
    if (state.screen == "terminoDiv") {
        currentTermino = state.currentTermino;
        gotoTermino(currentTermino);
    }
    if (state.screen == "toponimoDiv") {
        currentToponimo = state.currentToponimo;
        gotoToponimo(currentToponimo);
    }
}

function checkNoResults() {
    var valido = false;
    if ($("#resultadosETEnlaces").html() != null) {
        if ($("#resultadosETEnlaces").html().length > 0) {
            if ($("#jumbotronHome").is(":visible")) {
                valido = true;
            }
        } 
    }
    if ($("#resultadosNGEnlaces").html() != null) {
        if ($("#resultadosNGEnlaces").html().length > 0) {
            if ($("#jumbotronHome").is(":visible")) {
                valido = true;
            }
            if ($("#jumbotronNG").is(":visible")) {
                valido = true;
            }
        }
    }
    if ($("#resultadosTGEnlaces").html() != null) {
        if ($("#resultadosTGEnlaces").html().length > 0) {
            if ($("#jumbotronHome").is(":visible")) {
                valido = true;
            }
            if ($("#jumbotronTG").is(":visible")) {
                valido = true;
            }
        }
    }
    if ($("#resultadosET_DEnlaces").html() != null) {
        if ($("#resultadosET_DEnlaces").html().length > 0) {
            if ($("#jumbotronET").is(":visible")) {
                valido = true;
            }
        }
    }
    if ($("#resultadosET_MEnlaces").html() != null) {
        if ($("#resultadosET_MEnlaces").html().length > 0) {
            if ($("#jumbotronET").is(":visible")) {
                valido = true;
            }
        }
    }
    if (!valido) {
        $("#resultadosNO").show();
    } else {
        $("#resultadosNO").hide();
    }
}

function showMore(div) {
    $("#" + div + "_VM").hide();
    $("#" + div + "Enlaces .hide").removeClass("hide");
}

function gotoHome() {
    minAll();
    $("#resultadosET").hide();
    $("#resultadosNG").hide();
    $("#resultadosTG").hide();
    $("#resultadosET_D").hide();
    $("#resultadosET_M").hide();
    $("#resultadosNO").hide();
    $("#jumbotronNGAdd").hide();
    $("#resultadosNGAdd").hide();    
    $("#resultadosQP").hide();
    $("#jumbotronUnidad").hide();
    $("#homeDiv").show();
    $("#menuDiv").show();
    $("#jumbotronHome").show();
    $("#containerBusqueda").show();
    $("#resultadosDiv").show();
    $("#menuDiv.secundario").show();
    $("#resultadosET").hide();
    if ($("#resultadosETEnlaces").html() != null) {
        if ($("#resultadosETEnlaces").html().length > 0) {
            $("#resultadosET").show();
            $("#resultadosDiv").show();
        }
    }
    $("#resultadosNG").hide();
    if ($("#resultadosNGEnlaces").html() != null) {
        if ($("#resultadosNGEnlaces").html().length > 0) {
            $("#resultadosNG").show();
            $("#resultadosDiv").show();
        }
    }
    $("#resultadosTG").hide();
    if ($("#resultadosTGEnlaces").html() != null) {
        if ($("#resultadosTGEnlaces").html().length > 0) {
            $("#resultadosTG").show();
            $("#resultadosDiv").show();
        }
    }
    checkNoResults();
    pushState();
}

function gotoET() {
    minAll();
    $("#resultadosET").hide();
    $("#resultadosNG").hide();
    $("#resultadosTG").hide();
    $("#resultadosET_D").hide();
    $("#resultadosET_M").hide();
    $("#resultadosNO").hide();
    $("#jumbotronNGAdd").hide();
    $("#resultadosNGAdd").hide();
    $("#resultadosQP").hide();
    $("#homeDiv").show();
    $("#menuDiv").show();
    $("#jumbotronET").show();
    $("#containerBusqueda").show();
    $("#resultadosDiv").show();
    $("#resultadosET_D").hide();
    if ($("#resultadosET_DEnlaces").html() != null) {
        if ($("#resultadosET_DEnlaces").html().length > 0) {
            $("#resultadosET_D").show();
        }
    }
    $("#resultadosET_M").hide();
    if ($("#resultadosET_MEnlaces").html() != null) {
        if ($("#resultadosET_MEnlaces").html().length > 0) {
            $("#resultadosET_M").show();            
        }
    }
    checkNoResults();
    pushState();
}

function gotoNG() {
    minAll();
    $("#resultadosET").hide();
    $("#resultadosNG").hide();
    $("#resultadosTG").hide();
    $("#resultadosET_D").hide();
    $("#resultadosET_M").hide();
    $("#resultadosNO").hide();
    $("#jumbotronNGAdd").hide();
    $("#resultadosNGAdd").hide();
    $("#resultadosQP").hide();
    $("#homeDiv").show();
    $("#menuDiv").show();
    $("#jumbotronNG").show();
    $("#containerBusqueda").show();
    $("#resultadosDiv").show();
    $("#resultadosNG").hide();
    if ($("#resultadosNGEnlaces").html() != null) {
        if ($("#resultadosNGEnlaces").html().length > 0) {
            $("#resultadosNG").show();
        }
    }
    checkNoResults();
    pushState();
}

function gotoTG() {
    minAll();
    $("#resultadosET").hide();
    $("#resultadosNG").hide();
    $("#resultadosTG").hide();
    $("#resultadosET_D").hide();
    $("#resultadosET_M").hide();
    $("#resultadosNO").hide();
    $("#jumbotronNGAdd").hide();
    $("#resultadosNGAdd").hide();
    $("#resultadosQP").hide();
    $("#homeDiv").show();
    $("#menuDiv").show();
    $("#jumbotronTG").show();
    $("#containerBusqueda").show();
    $("#resultadosDiv").show();
    $("#resultadosTG").hide();
    if ($("#resultadosTGEnlaces").html() != null) {
        if ($("#resultadosTGEnlaces").html().length > 0) {
            $("#resultadosTG").show();
        }
    }
    checkNoResults();
    pushState();
}

function gotoNGAdd() {
    minAll();
    $("#homeDiv").show();    
    $("#jumbotronNGAdd").show();
    $("#jumbotronQP").hide();
    $("#resultadosDiv").show();
    $("#resultadosNGAdd").show();
    $("#resultadosQP").hide();
    $("#resultadosET").hide();
    $("#resultadosNG").hide();
    $("#resultadosTG").hide();
    $("#resultadosET_D").hide();
    $("#resultadosET_M").hide();
    $("#resultadosNO").hide();
    $("#resultadosTermino").hide();
    $("#jumbotronUnidad").hide();
    $("#ngaddInfo").hide();
    $("#ngaddAlert").hide();
    $("#ngaddNombresField").val("");
    $("#ngaddDescField").val("");
    $("#ngaddX").val("");
    $("#ngaddY").val("");
    $("#ngaddDepto").val("");
    $("#ngaddMunicipio").val("");
    $("#ngaddCategoria").val("");
    $("#ngaddX").attr("placeholder", sistemasCoordenadas[$("#ngaddCoordenada").val()].labLat);
    $("#ngaddY").attr("placeholder", sistemasCoordenadas[$("#ngaddCoordenada").val()].labLng);
    $("#ngaddX").val("2000000");
    $("#ngaddY").val("5000000");
    $("#ngaddCoordenada").val("EPSG:9377");
    ubicarNG();
}

function submitNG() {
    if (!(($("#ngaddNombresField").val() != null) && ($("#ngaddNombresField").val() != ""))) {
        $.alert("Debe ingresar un nombre");
        return;
    }
    if (!(($("#ngaddDescField").val() != null) && ($("#ngaddDescField").val() != ""))) {
        $.alert("Debe ingresar una descripción");
        return;
    }
    if (!(($("#ngaddCategoria").val() != null) && ($("#ngaddCategoria").val() != ""))) {
        $.alert("Debe seleccionar una categoria");
        return;
    }
    if (isNaN(parseFloat($("#ngaddX").val())) || (isNaN(parseFloat($("#ngaddY").val())))) {
        $.alert("Las coordenadas deben ser numericas");
        return;
    }
    if (!(($("#ngaddImage").val() != null) && ($("#ngaddImage").val() != ""))) {
        $.alert("Debe seleccionar un archivo");
        return;
    }

    var params = "";
    var paramsData = {};
    var formData = new FormData($("#ngaddImageField")[0]);
    paramsData.FILENAME = $("#ngaddImage").val().split('/').pop().split('\\').pop();

    paramsData.NOMBRE = $("#ngaddNombresField").val();
    paramsData.DESCRIPCION = b64EncodeUnicode($("#ngaddDescField").val());
    paramsData.CATEGORIA = $("#ngaddCategoria").val();
    paramsData.X = parseFloat($("#ngaddX").val());
    paramsData.Y = parseFloat($("#ngaddY").val());
    paramsData.SISTEMA = $("#ngaddCoordenada").val();
    if ((($("#ngaddDepto").val() != null) && ($("#ngaddDepto").val() != ""))) {
        paramsData.DEPTO = $("#ngaddDepto").val();
    }
    if ((($("#ngaddMunicipio").val() != null) && ($("#ngaddMunicipio").val() != ""))) {
        paramsData.MUNICIPIO = $("#ngaddMunicipio").val();
    }

    formData.append("params", JSON.stringify(paramsData));
    formData.append("file", $("#ngaddImage")[0].files[0]);
    params = params + "cmd=create_ng";
    params = params + "&t=" + (new Date()).getTime();

    loading = $.dialog({
        title: "Enviando", content: "Por favor, espere...",
        buttons: {}, closeIcon: false
    });

    $.ajax({
        url: web_service + "/diccionario?" + params,
        type: "POST",
        data: formData,
        cache: false,
        contentType: false,
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                console.log("ok");
                myXhr.upload.addEventListener('progress', function (evt) {
                    console.log(evt.loaded + " " + evt.total + " " + evt.lengthComputable);
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);
                        loading.setContent(percentComplete.toFixed(2) + " %");
                    }
                }, false);
            }
            return myXhr;
        },
        processData: false
    }).done(function (response) {
        loading.close();
        if (response.status) {
            $.confirm({
                title: "Nuevo nombre geográfico", content: "Operaci&oacute;n exitosa.",
                buttons: {
                    Ok: function () {
                        gotoHome();
                    }
                }, closeIcon: false
            });
        } else {
            $.confirm({
                title: "Nuevo nombre geográfico", content: "Operaci&oacute;n fallida. Intente m&aacute;s tarde.",
                buttons: {
                    Ok: function () {
                        
                    }
                }, closeIcon: false
            });
        };
    }).fail(function (error) {
        loading.close();
        $.confirm({
            title: "Nuevo nombre geográfico ", content: "Operaci&oacute;n fallida. Intente m&aacute;s tarde.",
            buttons: {
                Ok: function () {
                    
                }
            }, closeIcon: false
        });
    });
}

function ubicarNG() {
    var to = sistemasCoordenadas["EPSG:3857"].proj;
    var from = sistemasCoordenadas[$("#ngaddCoordenada").val()].proj;
    var reprojectedCoordsNew = proj4(from, to, [parseFloat($("#ngaddY").val()), parseFloat($("#ngaddX").val())]);
    ngAddMap.centerAt(new esri.Point({ x: reprojectedCoordsNew[0], y: reprojectedCoordsNew[1], "spatialReference": { "wkid": 102100, "latestWkid": 3857 } }));
}

function updateCoordenada() {
    $("#ngaddDepto").val("");
    $("#ngaddMunicipio").val("");

    var to = sistemasCoordenadas["EPSG:4326"].proj;
    var from = sistemasCoordenadas["EPSG:3857"].proj;
    var reprojectedCoordsNew = proj4(from, to, [ngAddMap.extent.getCenter().x, ngAddMap.extent.getCenter().y]);

    var lat = reprojectedCoordsNew[1];
    var lng = reprojectedCoordsNew[0];

    var pstWGS84 = new esri.Point({
        x: lng,
        y: lat,
        spatialReference: {
            wkid: 4686
        }
    });

    $.ajax({
        url: web_service + "/certificacion?cmd=consultar&lat=" + pstWGS84.y + "&lng=" + pstWGS84.x + "&t=" + (new Date()).getTime(),
        type: 'POST',
        success: function (data) {
            if (data.status) {
                if (data.LIMITES != null) {
                    if ($.isArray(data.LIMITES.DEPARTAMENTO)) {
                        if (data.LIMITES.DEPARTAMENTO.length > 0) {
                            $("#ngaddDepto").val(data.LIMITES.DEPARTAMENTO[0].attributes.DeNombre);
                        }
                    }

                    if ($.isArray(data.LIMITES.MUNICIPIO)) {
                        if (data.LIMITES.MUNICIPIO.length > 0) {
                            $("#ngaddMunicipio").val(data.LIMITES.MUNICIPIO[0].attributes.MpNombre);
                        }
                    }
                }
            }
        },
        error: function (_data) {
            
        }
    });
}

function gotoQP() {
    minAll();
    $("#homeDiv").show();
    $("#jumbotronQP").show();
    $("#resultadosDiv").show();
    $("#resultadosNGAdd").hide();
    $("#resultadosQP").show();
    $("#resultadosET").hide();
    $("#resultadosNG").hide();
    $("#resultadosTG").hide();
    $("#resultadosET_D").hide();
    $("#resultadosET_M").hide();
    $("#resultadosNO").hide();
    $("#resultadosTermino").hide();
    $("#jumbotronNGAdd").hide();
}


function updateResultados() {
    $("#resultadosDiv").hide();
    if (($("#inputSearch").val() == null) || ($("#inputSearch").val() == "")) {
        return;
    }
    $("#resultadosDiv").show();
    $("#resultadosQP").hide();
    $("#resultadosET").hide();
    $("#resultadosNG").hide();
    $("#resultadosAdd").hide();
    $("#resultadosTG").hide();
    $("#resultadosET_D").hide();
    $("#resultadosET_M").hide();
    $("#resultadosNO").hide();    
    $("#resultadosTermino").hide();
    $("#jumbotronNGAdd").hide();
    modoET = false;
    modoNG = false;
    modoTG = false;
    modoET2 = false;
    if ($("#jumbotronHome").is(":visible")) {
        modoET = true;
        modoNG = true;
    }
    if ($("#jumbotronET").is(":visible")) {
        modoET2 = true;
    }
    if ($("#jumbotronNG").is(":visible")) {
        modoNG = true;
    }
    if ($("#jumbotronTG").is(":visible")) {
        modoTG = true;
    }
    if (modoTG) {
        $("#resultadosTGEnlaces").html("");
        var strHTML_TG = "";
        var items_TG = 0;
        for (var i = 0; i < cacheTerminos.length; i++) {
            if (limpiarTexto(cacheTerminos[i].text).indexOf(limpiarTexto($("#inputSearch").val())) != -1) {
                if (item_TG < 50) {
                    strHTML_TG = strHTML_TG + "<a href='#' class='btn btnlink' onclick='gotoToponimo(\"" + cacheTerminos[i].text + "\")'>" + cacheTerminos[i].text + "</a>";
                } else {
                    strHTML_TG = strHTML_TG + "<a href='#' class='btn btnlink hide' onclick='gotoToponimo(\"" + cacheTerminos[i].text + "\")'>" + cacheTerminos[i].text + "</a>";
                }
                items_TG = items_TG + 1;
            }
        }
        if (strHTML_TG.length > 0) {
            if (items_TG > 50) {
                $("#resultadosTG_VM").show();
            } else {
                $("#resultadosTG_VM").hide();
            }
            $("#resultadosTGEnlaces").html(strHTML_TG);
            $("#resultadosTG").show();            
        } else {
            $("#resultadosTG").hide();
        }
        checkNoResults();
    }
    if ((modoET2) || (modoET) || (modoNG)) {
        $("#resultadosLoading").show();
        $("#resultadosETEnlaces").html("");
        $("#resultadosNGEnlaces").html("");
        $("#resultadosET_DEnlaces").html("");
        $("#resultadosET_MEnlaces").html("");
        $("#resultadosTGEnlaces").html("");

        if ($("#inputSearch").val().length >= 2) { 
            currentDraw = currentDraw + 1;
            var params = {
                cmd: "query_termino",
                draw: currentDraw,
                d: (new Date()).getTime(),
                start: 0,
                length: 100,
                aprox: $("#inputSearch").val().toUpperCase()
            };
            $.ajax({
                url: web_service + "/diccionario",
                data: params,
                type: 'POST',
                success: function (data) {
                    $("#resultadosLoading").hide();
                    if (data.status) {                        
                        if (data.draw == currentDraw) {

                            var strHTML_ET = "";
                            var strHTML_NG = "";
                            var strHTML_ET_D = "";
                            var strHTML_ET_M = "";

                            var items_ET = 0;
                            var items_NG = 0;
                            var items_ET_D = 0;
                            var items_ET_M = 0;

                            for (var i = 0; i < data.terminos.length; i++) {
                                if (data.terminos[i].TIPO == "Departamento") {
                                    if (items_ET_D < 50) {
                                        strHTML_ET_D = strHTML_ET_D + "<a href='#' class='btn btnlink' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].UNIDAD + "</a>";
                                    } else {
                                        strHTML_ET_D = strHTML_ET_D + "<a href='#' class='btn btnlink hide' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].UNIDAD + "</a>";
                                    }
                                    if (items_ET < 50) {
                                        strHTML_ET = strHTML_ET + "<a href='#' class='btn btnlink' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].UNIDAD + "</a>";
                                    } else {
                                        strHTML_ET = strHTML_ET + "<a href='#' class='btn btnlink hide' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].UNIDAD + "</a>";
                                    }
                                    items_ET = items_ET + 1;
                                    items_ET_D = items_ET_D + 1;
                                }
                                if (data.terminos[i].TIPO == "Municipio") {
                                    if (items_ET_M < 50) {
                                        strHTML_ET_M = strHTML_ET_M + "<a href='#' class='btn btnlink' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].UNIDAD + "</a>";
                                    } else {
                                        strHTML_ET_M = strHTML_ET_M + "<a href='#' class='btn btnlink hide' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].UNIDAD + "</a>";
                                    }
                                    if (items_ET < 50) {
                                        strHTML_ET = strHTML_ET + "<a href='#' class='btn btnlink' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].UNIDAD + "</a>";
                                    } else {
                                        strHTML_ET = strHTML_ET + "<a href='#' class='btn btnlink hide' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].UNIDAD + "</a>";
                                    }
                                    items_ET = items_ET + 1;
                                    items_ET_M = items_ET_M + 1;
                                }
                                if (!((data.terminos[i].TIPO == "Municipio") || (data.terminos[i].TIPO == "Departamento"))) {
                                    if (items_NG < 50) {
                                        strHTML_NG = strHTML_NG + "<a href='#' class='btn btnlink' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].NOMBRE_BUSQUEDA + " (" + data.terminos[i].UNIDAD + ")" + "</a>";
                                    } else {
                                        strHTML_NG = strHTML_NG + "<a href='#' class='btn btnlink hide' onclick='gotoTermino(" + data.terminos[i].ID_NOMBRES_GEO + ")'>" + data.terminos[i].NOMBRE_BUSQUEDA + " (" + data.terminos[i].UNIDAD + ")" + "</a>";
                                    }
                                    items_NG = items_NG + 1;
                                }
                            }

                            if ($("#jumbotronHome").is(":visible")) {
                                var strHTML_TG = "";
                                var items_TG = 0;
                                for (var i = 0; i < cacheTerminos.length; i++) {
                                    if (limpiarTexto(cacheTerminos[i].text).indexOf(limpiarTexto($("#inputSearch").val())) != -1) {
                                        if (items_TG < 50) {
                                            strHTML_TG = strHTML_TG + "<a href='#' class='btn btnlink' onclick='gotoToponimo(\"" + cacheTerminos[i].text + "\")'>" + cacheTerminos[i].text + "</a>";
                                        } else {
                                            strHTML_TG = strHTML_TG + "<a href='#' class='btn btnlink hide' onclick='gotoToponimo(\"" + cacheTerminos[i].text + "\")'>" + cacheTerminos[i].text + "</a>";
                                        }
                                        items_TG = items_TG + 1;
                                    }
                                }
                                if (strHTML_TG.length > 0) {
                                    if (items_TG > 50) {
                                        $("#resultadosTG_VM").show();
                                    } else {
                                        $("#resultadosTG_VM").hide();
                                    }
                                    $("#resultadosTGEnlaces").html(strHTML_TG);
                                    $("#resultadosTG").show();
                                } else {
                                    $("#resultadosTG").hide();
                                }
                            }

                            $("#resultadosETEnlaces").html(strHTML_ET);
                            $("#resultadosNGEnlaces").html(strHTML_NG);
                            $("#resultadosET_DEnlaces").html(strHTML_ET_D);
                            $("#resultadosET_MEnlaces").html(strHTML_ET_M);

                            if (modoET) {
                                if (strHTML_ET.length > 0) {
                                    if (items_ET > 50) {
                                        $("#resultadosET_VM").show();
                                    } else {
                                        $("#resultadosET_VM").hide();
                                    }
                                    $("#resultadosET").show();
                                    checkNoResults();
                                } else {
                                    $("#resultadosET").hide();
                                }
                            }
                            if (modoNG) {
                                if (strHTML_NG.length > 0) {
                                    if (items_NG > 50) {
                                        $("#resultadosNG_VM").show();
                                    } else {
                                        $("#resultadosNG_VM").hide();
                                    }
                                    $("#resultadosNG").show();
                                } else {
                                    $("#resultadosNG").hide();
                                }
                            }
                            if (modoET2) {
                                if (strHTML_ET_D.length > 0) {
                                    if (items_ET_D > 50) {
                                        $("#resultadosET_DVM").show();
                                    } else {
                                        $("#resultadosET_DVM").hide();
                                    }
                                    $("#resultadosET_D").show();
                                } else {
                                    $("#resultadosET_D").hide();
                                }
                                if (strHTML_ET_M.length > 0) {
                                    if (items_ET_M > 50) {
                                        $("#resultadosEM_DVM").show();
                                    } else {
                                        $("#resultadosEM_DVM").hide();
                                    }
                                    $("#resultadosET_M").show();
                                } else {
                                    $("#resultadosET_M").hide();
                                }
                            }
                            checkNoResults();

                        }
                    }
                },
                timeout: 20000,
                error: function (err) {

                }
            });
        }
       
    }
}


function pushState() {
    var state = {};
    if ($("#homeDiv").is(":visible")) {
        if ($("#jumbotronHome").is(":visible")) {
            state.screen = "home";
        }
        if ($("#jumbotronET").is(":visible")) {
            state.screen = "ET";
        }
        if ($("#jumbotronNG").is(":visible")) {
            state.screen = "NG";
        }
        if ($("#jumbotronTG").is(":visible")) {
            state.screen = "TG";
        }
    }
    if ($("#searchDiv").is(":visible")) {
        state.screen = "searchDiv";
    }
    if ($("#letterDiv").is(":visible")) {
        state.screen = "letterDiv";
    }
    if ($("#terminoDiv").is(":visible")) {
        state.screen = "terminoDiv";
    }
    if ($("#toponimoDiv").is(":visible")) {
        state.screen = "toponimoDiv";
    }
    if ($("#searchFiltro").val() != null) {
        state.searchFiltro = $("#searchFiltro").val();
    }
    if ($("#searchFiltroTipo").val() != null) {
        state.searchFiltroTipo = $("#searchFiltroTipo").val();
    }
    if ($("#searchFiltroLetra").val() != null) {
        state.searchFiltroLetra = $("#searchFiltroLetra").val();
    }
    if (currentTermino != null) {
        state.currentTermino = currentTermino;
    }
    if (currentToponimo != null) {
        state.currentToponimo = currentToponimo;
    }
    if (currentTerminoSearch != null) {
        state.currentTerminoSearch = currentTerminoSearch;
    }
    window.history.pushState(state, "Diccionario", getShareUrl());
}

function getCounterFilter() {
    counterFilter = counterFilter + 1;
    return counterFilter;
}

function defaultUserPhoto() {
    $("#userPhoto,#userPhoto2").attr("src", "./images/iconos/User.png");
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

function minAll() {
    $("#homeDiv").hide();
    $("#resultadosDiv").hide();
    $("#jumbotronHome").hide();
    $("#jumbotronET").hide();
    $("#jumbotronNG").hide();
    $("#jumbotronTG").hide();
    $("#jumbotronQP").hide();
    $("#jumbotronTopo").hide();
    $("#jumbotronTermino").hide();
    $("#containerBusqueda").hide();
    $("#searchDiv").hide();
    $("#menuDiv").hide();
    $("#letterDiv").hide();
    $("#collapseTerminoOtrosDiv").hide();    
    $("#resultadosTermino").hide();
    $("#terminoDiv").hide();
    $("#toponimoDiv").hide();
    $("html, body").animate({ scrollTop: 0 });
}

function getCurrentLetterPos() {
    for (var i = 0; i < letraArray.length; i++) {
        if (currentLetter == letraArray[i]) {
            return i;
        }
    }
    return 0;
}

function prevLetter() {
    var pos = getCurrentLetterPos();
    if (pos == 0) {
        gotoLetter(letraArray[letraArray.length - 1]);
    } else {
        gotoLetter(letraArray[pos - 1]);
    }
}

function nextLetter() {
    var pos = getCurrentLetterPos();
    if (pos == (letraArray.length - 1)) {
        gotoLetter(letraArray[0]);
    } else {
        gotoLetter(letraArray[pos + 1]);
    }
}

function prevLetterClass() {
    var pos = getCurrentLetterPos();
    var prevL;
    if (pos == 0) {
        prevL = letraArray[letraArray.length - 1];
    } else {
        prevL = letraArray[pos - 1];
    }
    if (prevL.toLowerCase() == "ñ") {
        return "letterSmNTILDE";
    } else {
        return "letterSm" + prevL.toUpperCase();
    }
}

function nextLetterClass() {
    var pos = getCurrentLetterPos();
    var nextL;
    if (pos == (letraArray.length - 1)) {
        nextL = letraArray[0];
    } else {
        nextL = letraArray[pos + 1];
    }
    if (nextL.toLowerCase() == "ñ") {
        return "letterSmNTILDE";
    } else {
        return "letterSm" + nextL.toUpperCase();
    }
}


function gotoLetter(letra) {
    gotoLetter2(letra);
    pushState();
}

function gotoLetter2(letra) {
    currentLetter = letra;
    window.document.title = "Letra " + currentLetter + " - Diccionario Geográfico de Colombia";
    minAll();
    if (letra.toLowerCase() == "ñ") {
        $("#letterImg").attr("src", "./images/DICCIONARIO/LETRAS/ntilde.png");
        $("#letterActual").html("<div class='letterSM letterSmNTILDE'></div>");
    } else {
        $("#letterImg").attr("src", "./images/DICCIONARIO/LETRAS/" + letra.toLowerCase() + ".png");
        $("#letterActual").html("<div class='letterSM letterSm" + letra.toUpperCase() + "'></div>");
    }
    $("#letterHeader1").html(letra + "-" + letra.toLowerCase());
    $("#letterPrev").html("<div class='letterSM " + prevLetterClass() + "'></div>");
    $("#letterNext").html("<div class='letterSM " + nextLetterClass() + "'></div>");

    $("#letterDiv").show();
    prevScreen = "letter";
    $("html,body").animate({ scrollTop: 0 });
    if (tableSearchLetter == null) {
        tableSearchLetter = $("#tableSearchLetter").DataTable({
            dom: '<"top"<"clear">>rt<"bottom"pil<"clear">>',
            lengthMenu: [[125], ["125"]],
            language: spanishDataTable,
            processing: true,
            serverSide: true,
            ajax: {
                url: web_service + "/diccionario",
                deferLoading: 0,
                data: function (d) {
                    d.cmd = "query_letter";
                    d.letra = currentLetter;
                },
                dataSrc: function (dataRow) {
                    $("#letterHeaderMinMax").html(dataRow.minTermino + " - " + dataRow.maxTermino);
                    $("#letterHeaderCount").html("<a href='#' onclick='masLetra(); return false;'>" + dataRow.TOTAL_NOMBRE + "</a>");
                    $("#letterHeaderCount2").html("<a href='#' onclick='masLetra(); return false;'>" + dataRow.TOTAL_TIPO + "</a>");
                    return dataRow.terminos;
                }
            },
            fnInitComplete: function () {

            },
            drawCallback: function (settings) {
                var api = this.api();
                $("#listResultsLetter").html("");
                var dataRow = api.rows({ page: 'current' }).data();
                var strHTML = "";
                strHTML = strHTML + "<div class='letter2 letter2i'>";
                $("#listResultsLetterRange").html(dataRow[0].NOMBRE + " - " + dataRow[dataRow.length-1].NOMBRE);
                for (var i = 0; i < dataRow.length; i++) {
                    var ids = dataRow[i].ID_NOMBRES_GEO.split(",");
                    if (ids.length == 1) {
                        strHTML = strHTML + "<a href='#' onclick='gotoTerminoSearchTermino(\"" + dataRow[i].NOMBRE + "\"); return false;'>" + dataRow[i].NOMBRE + "</a><br />";
                    } else {
                        strHTML = strHTML + "<a href='#' onclick='gotoTerminoSearchTermino(\"" + dataRow[i].NOMBRE + "\"); return false;'>" + dataRow[i].NOMBRE + " (" + ids.length + ")</a><br />";
                    }
                    if ((i + 1) == dataRow.length) {
                        strHTML = strHTML + "</div>";
                    } else {
                        if (((i + 1) % 25) == 0) {
                            strHTML = strHTML + "</div>";
                            strHTML = strHTML + "<div class='letter2 letter2i'>";
                        }
                    }
                }
                $("#listResultsLetter").append(strHTML);

            },
            columns: [
                {
                    orderable: false,
                    data: "ID_NOMBRES_GEO"
                },
                {
                    data: "NOMBRE",
                }
            ]
        });
    } else {
        tableSearchLetter.ajax.reload();
    }
}

function gotoToponimo(id) {
    minAll();
    currentToponimo = id;
    reporteUso("Toponimo", { toponimo: currentToponimo });
    window.document.title = currentToponimo + " - Diccionario Geográfico de Colombia";
    $("#homeDiv").show();
    $("#jumbotronTopo").show();
    $("#toponimoNombre").html("");
    $("#toponimoResultsTipo").hide();
    $("#jumbotronUnidad").hide();
    $("#toponimoDescripcion").html("");
    $("body").animate({ scrollTop: 0 });
    var params = {};
    params.tipo = currentToponimo;
    $.ajax({
        url: web_service + "/diccionario?cmd=query_resumen_tipo",
        data: params,
        type: 'POST',
        success: function (data) {
            if (data.status) {

                $("#toponimoNombre").html(data.TERMINO.NOMBRE);
                $("#toponimoDescripcion").html(data.TERMINO.DEFINICION);

                var imageUrl = "./images/TERMINOS/" + data.TERMINO.ID_TERMINO + ".png";
                $("#toponimoResultsTipoHeader").attr("src", imageUrl);

                var strHTML = "";
                strHTML = strHTML + "<h4>" + data.TERMINO.NOMBRE + "</h4>";

                strHTML = strHTML + "<hr style='border-top: 1px solid lightgray;'/>";

                if (data.RESUMEN_UNIDADES != null) {
                    if (data.RESUMEN_UNIDADES.length > 0) {
                        strHTML = strHTML + "<strong>Departamentos m&aacute;s frecuentes:</strong>";
                        strHTML = strHTML + "<ul class='count123' style='padding-left: 15px;'>";
                        for (var j = 0; j < data.RESUMEN_UNIDADES.length; j++) {
                            strHTML = strHTML + "<li>" + data.RESUMEN_UNIDADES[j].NOMBRE + ": ";
                            strHTML = strHTML + "<div class='count'><a href='#' onclick='masUnidadTipo(\"" + data.RESUMEN_UNIDADES[j].CODIGO + "\",\"" + currentTipoSearch + "\");return false;'>" + data.RESUMEN_UNIDADES[j].CONTEO + "</a></div>";
                            strHTML = strHTML + "</li>";
                        }
                        strHTML = strHTML + "</ul>";
                    }
                }
                strHTML = strHTML + "";
                strHTML = strHTML + "";
                strHTML = strHTML + "";
                strHTML = strHTML + "";
                $("#toponimoResultsTipoContenido").html(strHTML);
                $("#toponimoResultsTipo").show();
            }
        },
        timeout: 20000,
        error: function (err) {

        }
    });
}

function gotoTermino(id) {
    currentTermino = id;
    minAll();
    $("#homeDiv").show();
    $("#jumbotronTermino").show();
    $("#resultadosDiv").show();
    $("#resultadosQP").hide();
    $("#resultadosET").hide();
    $("#resultadosNG").hide();
    $("#resultadosTG").hide();
    $("#resultadosET_D").hide();
    $("#resultadosET_M").hide();
    $("#resultadosTermino").show();    
    $("#resultadosTerminoDEMS").hide();

    $("#terminoNombre").html("");
    $("#terminoDescripcion").html("");
    $("#terminoSubtitle").html("");
    $("#terminoLetter").attr("src", "");
    $("#terminoNombreAudioLabel").hide();
    $("#terminoNombreAudio").hide();
    $("#terminoNombreAudio").hide();
    $("#terminoGentilicioAudioLabel").hide();
    $("#terminoGentilicioAudio").hide();
    $("#terminoCard").hide();
    $("#terminoCard2").hide();
    $("#collapseTerminoOtrosDiv").show();    
    $("#terminoOtrosDiv").html("");
    $("#terminoDefinicionDiv").html("");
    $("body").animate({ scrollTop: 0 });
    $.ajax({
        url: web_service + "/diccionario?cmd=get&ID_NOMBRES_GEO=" + currentTermino,
        type: 'POST',
        success: function (data) {
            if (data.status) {
                currentTerminoDetail = data.nombre;
                $("#terminoNombre").html(data.nombre.NOMBRE);
                if ((data.nombre.AUDIO1 != null) && (data.nombre.AUDIO2 != null)) {
                    if ((data.nombre.AUDIO1 == true) && (data.nombre.AUDIO2 == true)) {
                        $("#terminoEspacioAudio").show();
                    }
                }
                if (data.nombre.AUDIO1 != null) {
                    if (data.nombre.AUDIO1 == true){
                        $("#terminoNombreAudioLabel").show();
                        $("#terminoNombreAudio").show();
                    }
                }
                if (data.nombre.AUDIO2 != null) {
                    if (data.nombre.AUDIO2 == true) {
                        $("#terminoGentilicioAudioLabel").show();
                        $("#terminoGentilicioAudio").show();
                    }
                }
                if (data.nombre.NOMBRE.toLowerCase() == "ñ") {
                    $("#terminoLetter").attr("src", "./images/DICCIONARIO/LETRAS/ntilde.png");
                } else {
                    $("#terminoLetter").attr("src", "./images/DICCIONARIO/LETRAS/" + data.nombre.NOMBRE.toLowerCase().substring(0, 1) + ".png");
                }
                var strHTML = "";
                strHTML = strHTML + "<div style='padding-bottom: 10px;'>";
                if ((data.nombre.TIPO != null) && (data.nombre.TIPO != "")) {
                    strHTML = strHTML + "<a href='#' onclick='gotoToponimo(\"" + data.nombre.TIPO + "\");pushState();return false;' style=' filter: brightness(64%) saturate(240%); color: " + getColorByTipo(data.nombre.TIPO) + ";'>" + data.nombre.TIPO.toUpperCase() + "</a>&nbsp;";
                }
                strHTML = strHTML + "&nbsp;";
                if ((data.nombre.UNIDAD != null) && (data.nombre.UNIDAD != "")) {
                    strHTML = strHTML + "en <a href='#' style='color: #337ab7; margin-left: 5px; text-decoration: underline;'  onclick='masUnidad(\"" + data.nombre.CODIGO + "\"); return false;'>" + data.nombre.UNIDAD + "</a>";
                    window.document.title = data.nombre.NOMBRE + " en " + data.nombre.UNIDAD + " - Diccionario Geográfico de Colombia";
                    reporteUso("Termino", { termino: data.nombre.NOMBRE + ", " + data.nombre.UNIDAD});
                } else {
                    window.document.title = data.nombre.NOMBRE + " - Diccionario Geográfico de Colombia";
                    reporteUso("Termino", { termino: data.nombre.NOMBRE });
                }
                $("#terminoSubtitle").html(strHTML);
                $("#terminoCardContainer").css("border-top", "5px solid " + getColorByTipo(data.nombre.TIPO))
                if ((data.nombre.TIPO == "Departamento") || (data.nombre.TIPO == "Municipio")) {
                    $("#resultadosTerminoDEMS").show();
                    $("#terminoDescripcion").html(ajusteTexto(data.nombre.DESCRIPCION));
                    if (data.ANEXOS != null) {
                        if (data.ANEXOS.length > 0) {
                            var anexosStr = "<br/>";
                            anexosStr = anexosStr + "";
                            anexosStr = anexosStr + "<div class='panel-group' id='accordion' role='tablist' aria-multiselectable='true'>";
                            for (var j = 0; j < data.ANEXOS.length; j++) {
                                anexosStr = anexosStr + "<div class='panel panel-default'>";
                                anexosStr = anexosStr + "<div class='panel-heading' role='tab' id='heading" + j + "'>";
                                anexosStr = anexosStr + "<h4 class='panel-title'>";
                                anexosStr = anexosStr + "<a role='button' data-toggle='collapse' data-parent='#accordion' href='#collapse" + j + "' aria-expanded='true' aria-controls='collapse" + j + "'>";
                                anexosStr = anexosStr + "<strong>" + data.ANEXOS[j].TITULO.toUpperCase() + "</strong><br/>";
                                anexosStr = anexosStr + "</a>";
                                anexosStr = anexosStr + "</h4>";
                                anexosStr = anexosStr + "</div>";

                                anexosStr = anexosStr + "<div id='collapse" + j + "' class='panel-collapse collapse' role='tabpanel' aria-labelledby='heading" + j + "'>";
                                anexosStr = anexosStr + "<div class='panel-body'>";
                                anexosStr = anexosStr + data.ANEXOS[j].TEXTO;

                                if (data.ANEXOS[j].FUENTE != null) {
                                    if (data.ANEXOS[j].FUENTE.length > 0) {
                                        anexosStr = anexosStr + "(Fuente: " + data.ANEXOS[j].FUENTE + ")";
                                    }
                                }
                                anexosStr = anexosStr + "</div>";
                                anexosStr = anexosStr + "</div>";

                                anexosStr = anexosStr + "</div>";
                            }
                            anexosStr = anexosStr + "</div>";
                            $("#terminoDescripcion").html(anexosStr);
                        }
                    }
                } else {
                    if (data.nombre.DESCRIPCION.length < 300) {
                        $("#terminoSubtitle").html(data.nombre.DESCRIPCION + "<br /><br />" + $("#terminoSubtitle").html());
                    } else {
                        $("#terminoDescripcion").html(data.nombre.DESCRIPCION);
                    }                    
                }
                if (data.nombre.DESCRIPCION.length > 1000) {
                    $("#terminoCard").show();
                } else {
                    $("#terminoCard2").show();
                }
                if (data.SIMILARES != null) {
                    if (data.SIMILARES.length > 1) {
                        strHTML = "<br/>";
                        strHTML = strHTML + "<strong>" + "<p>" + data.nombre.NOMBRE_BUSQUEDA.toLowerCase () + "</p>" + " tambi&eacute;n es un(a):</strong>";
                        strHTML = strHTML + "<ul class='list-also'>";
                        for (var j = 0; j < data.SIMILARES.length; j++) {
                            if (data.SIMILARES[j].CODIGO != data.nombre.CODIGO) {
                                if (data.SIMILARES[j].UNIDAD != null) {
                                    strHTML = strHTML + "<li><span style='font-weight: bold; filter: brightness(64%) saturate(240%); color: " + getColorByTipo(data.SIMILARES[j].TIPO) + ";'>" + data.SIMILARES[j].TIPO.toUpperCase() + "</span>&nbsp;";
                                    strHTML = strHTML + "en <a href='#' style='color: #337ab7; margin-left: 5px; text-decoration: underline;' onclick='gotoTermino(" + data.SIMILARES[j].ID_NOMBRES_GEO +");'>" + data.SIMILARES[j].UNIDAD + "</a>";
                                    strHTML = strHTML + "<br/></li>";
                                }
                            }
                        }
                        var divCard = $('<div class="card"></div>').html(strHTML);
                        $("#terminoOtrosDiv").html(divCard);
                        strHTML = strHTML + "</ul>";
                    }
                }
                if (data.TERMINO != null) {
                    strHTML = "";
                    strHTML = strHTML + "<strong>¿Qu&eacute; es un(a) " + "<a>" + data.TERMINO.NOMBRE + "</a>"  + "?" + " </strong>";
                    strHTML = strHTML + "<p>" + data.TERMINO.DEFINICION + "</p>";
                    $("#terminoDefinicionDiv").html(strHTML);
                }
                loadTerminoUnidad(data.nombre.CODIGO);
            }
        },
        error: function (_data) {

        }
    });
}

function playNombreAudio() {
    if (audio1 != null) {
        if (audio1.playing()) {
            audio1.stop();
            $("#terminoNombrePlayBtn").addClass("play");
            $("#terminoNombrePlayBtn").removeClass("pause");
            return;
        }
    }
    if (audio2 != null) {
        if (audio2.playing()) {
            audio2.stop();
            $("#terminoGentilicioPlayBtn").addClass("play");
            $("#terminoGentilicioPlayBtn").removeClass("pause");
        }
    }
    audio1 = new Howl({
        src: [web_service + "/diccionario?cmd=download_audio&ID_NOMBRES_GEO=" + currentTermino + "&id=1"],
        html5: true,
        loop: false,
        volume: 1,
        onload: function () {
            $("#terminoNombrePlayBtn").addClass("pause");
            $("#terminoNombrePlayBtn").removeClass("play");
        },
        onend: function () {
            $("#terminoNombrePlayBtn").addClass("play");
            $("#terminoNombrePlayBtn").removeClass("pause");
        }
    });
    audio1.play();
}

function playGentilicioAudio() {
    if (audio1 != null) {
        if (audio1.playing()) {
            audio1.stop();
            $("#terminoNombrePlayBtn").addClass("play");
            $("#terminoNombrePlayBtn").removeClass("pause");
        }
    }
    if (audio2 != null) {
        if (audio2.playing()) {
            audio2.stop();
            $("#terminoGentilicioPlayBtn").addClass("play");
            $("#terminoGentilicioPlayBtn").removeClass("pause");
            return;
        }
    }
    audio2 = new Howl({
        src: [web_service + "/diccionario?cmd=download_audio&ID_NOMBRES_GEO=" + currentTermino + "&id=2"],
        html5: true,
        loop: false,
        volume: 1,
        onload: function () {
            $("#terminoGentilicioPlayBtn").addClass("pause");
            $("#terminoGentilicioPlayBtn").removeClass("play");
        },
        onend: function () {
            $("#terminoGentilicioPlayBtn").addClass("play");
            $("#terminoGentilicioPlayBtn").removeClass("pause");
        }
    });
    audio2.play();
}

function ajusteTexto(text) {
    var textos = text.split(/([A-ZÁÉÍÓÚ\s]{7,})/);
    var output = "";
    for (var i = 0; i < textos.length; i++) {
        if (textos[i].trim().length > 0) {
            if ((!/[^ A-ZÁÉÍÓÚÑ]/.test(textos[i]))) {
                output = output + "<br/><strong>" + textos[i].trim() + "</strong><br/>";
            } else {
                textos[i] = textos[i].trim();
                if (textos[i].startsWith(". ")) {
                    textos[i] = textos[i].substring(2);
                }
                output = output + textos[i];
            }
        }
    }
    if (output.startsWith("<br/>")) {
        output = output.substring(5);
    }
    return output;
}

function loadTerminoUnidad(codigo) {
    var params = {};
    if (codigo.length == 2) {
        params.tipo = "DEPTO";
    }
    if (codigo.length == 5) {
        params.tipo = "MUNI";
    }
    params.id = codigo;
    $("#terminoResultsUnidadHeader").hide();
    $.ajax({
        url: web_service + "/diccionario?cmd=query_resumen_unidad",
        data: params,
        type: 'POST',
        success: function (data) {
            if (data.status) {
                currentCaracterizacion = data;
                var strHTML = "";
                strHTML = strHTML + "<h4>" + currentCaracterizacion.NOMBRE + "</h4>";
                strHTML = strHTML + "<span>Top&oacute;nimos: " + "<a>" + currentCaracterizacion.TOTAL_NOMBRE + "</a>" + "</span><br/>";
                strHTML = strHTML + "<span>T&eacute;rminos geogr&aacute;ficos: " + "<a>" + currentCaracterizacion.TOTAL_TIPO + "</a>" + "</span>";

                try {
                    var extentCaracterizacion = null;
                    if (currentCaracterizacion.SHAPE != null) {
                        extentCaracterizacion = esri.jsonUtilsGeometry.fromJson(Terraformer.ArcGIS.convert(new Terraformer.Primitive(JSON.parse(currentCaracterizacion.SHAPE))));
                    } else {
                        extentCaracterizacion = esri.Polygon.fromExtent(default_extent);
                    }
                    if (extentCaracterizacion != null) {
                        var thumbExtent = extentCaracterizacion.getExtent();
                        var imageUrl = thumbnail_geodesia_service + "bboxSR=4326&layers=&layerDefs=&size=480,240&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image&bbox=" +
                            thumbExtent.xmin + "%2C" +
                            thumbExtent.ymin + "%2C" +
                            thumbExtent.xmax + "%2C" +
                            thumbExtent.ymax;
                        terminoResultsUnidadHeader.setExtent(thumbExtent);
                        //$("#terminoResultsUnidadHeader").css("background", "url(" + imageUrl + ")");
                        $("#terminoResultsUnidadHeader").show();
                    }
                } catch (err) {

                }

                if (currentCaracterizacion.CODIGO != null) {
                    $("#terminoResultsUnidadHeaderImg").attr("src", "../images/DEPTOS/" + currentCaracterizacion.CODIGO.substring(0, 2) + ".png");
                    $("#terminoResultsUnidadHeaderImg").show();
                }

                strHTML = strHTML + "<hr style='border-top: 1px solid lightgray;'/>";
                if (currentCaracterizacion.RESUMEN_TIPO != null) {
                    if (currentCaracterizacion.RESUMEN_TIPO.length > 1) {
                        strHTML = strHTML + "<strong>T&eacute;rminos geogr&aacute;ficos m&aacute;s frecuentes:</strong>";
                        strHTML = strHTML + "<ul class='count123' style='padding-left: 15px; margin-bottom: 20px;'>";
                        for (var j = 0; j < currentCaracterizacion.RESUMEN_TIPO.length; j++) {
                            strHTML = strHTML + "<li>" + currentCaracterizacion.RESUMEN_TIPO[j].TIPO + ": ";
                            strHTML = strHTML + "<div class='count'><a href='#' onclick='masUnidadTipo(\"" + currentCaracterizacion.CODIGO + "\",\"" + currentCaracterizacion.RESUMEN_TIPO[j].TIPO + "\");return false;'>" + currentCaracterizacion.RESUMEN_TIPO[j].CONTEO + "</a></div>";
                            strHTML = strHTML + "</li>";
                        }
                        strHTML = strHTML + "</ul>";
                    }
                }
                if (currentCaracterizacion.RESUMEN_NOMBRE != null) {
                    if (currentCaracterizacion.RESUMEN_NOMBRE.length > 1) {
                        strHTML = strHTML + "<strong>Top&oacute;nimos m&aacute;s frecuentes:</strong>";
                        strHTML = strHTML + "<ul class='count123' style='padding-left: 15px; margin-bottom: 20px;'>";
                        for (var j = 0; j < currentCaracterizacion.RESUMEN_NOMBRE.length; j++) {
                            strHTML = strHTML + "<li>" + currentCaracterizacion.RESUMEN_NOMBRE[j].TIPO + ": ";
                            strHTML = strHTML + "<div class='count'><a href='#' onclick='masUnidadTermino(\"" + currentCaracterizacion.CODIGO + "\",\"" + currentCaracterizacion.RESUMEN_NOMBRE[j].TIPO + "\");return false;'>" + currentCaracterizacion.RESUMEN_NOMBRE[j].CONTEO + "</a></div>";
                            strHTML = strHTML + "</li>";
                        }
                        strHTML = strHTML + "</ul>";
                    }
                }
                strHTML = strHTML + "<div class='content-botones'>";
                //strHTML = strHTML + "<div class='botones-tarjeta'><button onclick='masUnidad(null);' class='masde'>M&aacute;s de " + currentCaracterizacion.NOMBRE + "</button></div>"
                strHTML = strHTML + "<div class='botones-tarjeta'><button onclick='openCEM();' class='btnCEM button btn btn-default'>Más info. en Colombia en Mapas</button></div>"
                strHTML = strHTML + "</div>";
                strHTML = strHTML + "";
                strHTML = strHTML + "";
                strHTML = strHTML + "";
                $("#terminoResultsUnidadContenido").html(strHTML);
                $("#terminoResultsUnidad").show();
            }
        },
        timeout: 20000,
        error: function (err) {

        }
    });
}

function openCEM() {
    var cemURL = "https://www.colombiaenmapas.gov.co/?u=";
    if (currentCaracterizacion.CODIGO == null) {
        cemURL = cemURL + "0";
    } else {
        cemURL = cemURL + currentCaracterizacion.CODIGO;
        try {
            var extentCaracterizacion = null;
            if (currentCaracterizacion.SHAPE != null) {
                extentCaracterizacion = esri.jsonUtilsGeometry.fromJson(Terraformer.ArcGIS.convert(new Terraformer.Primitive(JSON.parse(currentCaracterizacion.SHAPE))));
            } else {
                extentCaracterizacion = esri.Polygon.fromExtent(default_extent);
            }
            if (extentCaracterizacion != null) {
                var thumbExtent = extentCaracterizacion.getExtent();
                cemURL = cemURL + "&e=" + thumbExtent.xmin + "%2C" +
                    thumbExtent.ymin + "%2C" +
                    thumbExtent.xmax + "%2C" +
                    thumbExtent.ymax;
            }
        } catch (err) {

        }
    }
    window.open(cemURL, "_blank");
}

function masUnidad(id) {
    if (id == null) {
        if (currentCaracterizacion.CODIGO == null) {
            currentUnidadSearch = "0";
        } else {
            currentUnidadSearch = currentCaracterizacion.CODIGO;
        }
    } else {
        currentUnidadSearch = id;
    }
    currentTipoSearch = null;
    currentTerminoSearch = null;
    currentLetterSearch = null;
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltro").val(currentUnidadSearch);
    $("#searchFiltro").trigger("change.select2");
    $("#searchFiltroTipo").val(null);
    $("#searchFiltroTipo").trigger("change.select2");
    $("#searchFiltroLetra").val(null);
    $("#searchFiltroLetra").trigger("change.select2");
    $('.searchCtrl2').val(null);
    updateSearch();
}

function masLetra() {
    currentUnidadSearch = null;
    currentTipoSearch = null;
    currentTerminoSearch = null;
    currentLetterSearch = currentLetter;
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltro").val(null);
    $("#searchFiltro").trigger("change.select2");
    $("#searchFiltroTipo").val(null);
    $("#searchFiltroTipo").trigger("change.select2");
    $("#searchFiltroLetra").val(currentLetterSearch);
    $("#searchFiltroLetra").trigger("change.select2");
    $('.searchCtrl2').val(null);
    updateSearch();
}

function masLetraTipo(idLetra, idTipo) {
    currentUnidadSearch = null;
    currentTipoSearch = idTipo;
    currentTerminoSearch = null;
    currentLetterSearch = idLetra;
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltro").val(null);
    $("#searchFiltro").trigger("change.select2");
    $("#searchFiltroTipo").val([currentTipoSearch]);
    $("#searchFiltroTipo").trigger("change.select2");
    updateTags();
    $("#searchFiltroLetra").val(currentLetterSearch);
    $("#searchFiltroLetra").trigger("change.select2");
    $('.searchCtrl2').val(null);
    updateSearch();
}

function masLetraTermino(idLetra, idTermino) {
    currentUnidadSearch = null;
    currentTipoSearch = null;
    currentTerminoSearch = idTermino;
    currentLetterSearch = idLetra;
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltro").val(null);
    $("#searchFiltro").trigger("change.select2");
    $("#searchFiltroTipo").val([currentTipoSearch]);
    $("#searchFiltroTipo").trigger("change.select2");
    updateTags();
    $("#searchFiltroLetra").val(currentLetterSearch);
    $("#searchFiltroLetra").trigger("change.select2");
    $('.searchCtrl2').val(currentTerminoSearch);
    updateSearch();
}

function masUnidadTipo(idUnidad, idTipo) {
    if (idUnidad == null) {
        if (currentCaracterizacion.CODIGO == null) {
            currentUnidadSearch = "0";
        } else {
            currentUnidadSearch = currentCaracterizacion.CODIGO;
        }
    } else {
        currentUnidadSearch = idUnidad;
    }
    currentTipoSearch = idTipo;
    currentTerminoSearch = null;
    currentLetterSearch = null;
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltro").val(currentUnidadSearch);
    $("#searchFiltro").trigger("change.select2");
    $("#searchFiltroTipo").val([currentTipoSearch ]);
    $("#searchFiltroTipo").trigger("change.select2");
    updateTags();
    $("#searchFiltroLetra").val(null);
    $("#searchFiltroLetra").trigger("change.select2");
    $('.searchCtrl2').val(null);
    updateSearch();
}

function masUnidadTermino(idUnidad, idTermino) {
    if (idUnidad == null) {
        if (currentCaracterizacion.CODIGO == null) {
            currentUnidadSearch = "0";
        } else {
            currentUnidadSearch = currentCaracterizacion.CODIGO;
        }
    } else {
        currentUnidadSearch = idUnidad;
    }
    currentTipoSearch = null;
    currentTerminoSearch = idTermino;
    currentLetterSearch = null;
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltro").val(currentUnidadSearch);
    $("#searchFiltro").trigger("change.select2");
    $("#searchFiltroTipo").val(null);
    $("#searchFiltroTipo").trigger("change.select2");
    $("#searchFiltroLetra").val(null);
    $("#searchFiltroLetra").trigger("change.select2");
    $('.searchCtrl2').val(currentTerminoSearch);
    updateSearch();
}

function gotoTerminoSearchTermino(termino) {
    currentTerminoSearch = termino;
    window.document.title = currentTerminoSearch + " - Diccionario Geográfico de Colombia";
    $('.searchCtrl2').val(currentTerminoSearch);
    currentUnidadSearch = null;
    currentTipoSearch = null;
    updateSearch();
}

function gotoTerminoSearchUnidad(codigo, texto) {
    currentTerminoSearch = null;
    currentUnidadSearch = codigo;
    currentTipoSearch = null;
    gotoTerminoSearch();
}

function gotoTerminoSearch() {
    minAll();
    $("#homeDiv").show();
    $("#jumbotronUnidad").show();
    $("#searchDiv").show();
    prevScreen = "search";
    $("#listResultsContainer").html("");
    $("#listResultsUnidad").hide();
    $("#listResultsTipo").hide();
    $("#listResultsLetra").hide();
    $("html, body").animate({ scrollTop: 0 });
    isTarjeta = false;
    if ((currentUnidadSearch != null) && (!isTarjeta)) {
        isTarjeta = true;
        var params = {};
        if (currentUnidadSearch == "0") {
            params.tipo = "PAIS";
        }
        if (currentUnidadSearch.length == 5) {
            params.tipo = "MUNI";
        }
        if (currentUnidadSearch.length == 2) {
            params.tipo = "DEPTO";
        }
        params.id = currentUnidadSearch;
        $("#listResultsUnidadHeader").hide();
        $("#listResultsUnidadHeaderImg").hide();
        $.ajax({
            url: web_service + "/diccionario?cmd=query_resumen_unidad",
            data: params,
            type: 'POST',
            success: function (data) {
                if (data.status) {
                    updateTarjetaUnidad(data);
                    updateTarjetaUnidadHeader(data);
                }
            },
            timeout: 20000,
            error: function (err) {

            }
        });
    }
    if ((currentTipoSearch != null) && (!isTarjeta)) {
        if (currentTipoSearch.split(";").length == 1) {
            isTarjeta = true;
            var params = {};
            params.tipo = currentTipoSearch;
            $("#listResultsTipoHeader").hide();
            $.ajax({
                url: web_service + "/diccionario?cmd=query_resumen_tipo",
                data: params,
                type: 'POST',
                success: function (data) {
                    if (data.status) {

                        var imageUrl = "./images/TERMINOS/" + data.TERMINO.ID_TERMINO + ".png";
                        $("#listResultsTipoHeader").css("background", "url(" + imageUrl + ")");
                        $("#listResultsTipoHeader").css("background-color", getColorByTipo(data.TERMINO.NOMBRE));
                        $("#listResultsTipoHeader").show();

                        var strHTML = "";
                        strHTML = strHTML + "<h4>" + data.TERMINO.NOMBRE + "</h4>";

                        strHTML = strHTML + "<hr style='border-top: 1px solid lightgray;'/>";

                        if (data.RESUMEN_UNIDADES != null) {
                            if (data.RESUMEN_UNIDADES.length > 0) {
                                strHTML = strHTML + "<strong>Departamentos m&aacute;s frecuentes:</strong>";
                                strHTML = strHTML + "<ul class='count123' style='padding-left: 15px;'>";
                                for (var j = 0; j < data.RESUMEN_UNIDADES.length; j++) {
                                    strHTML = strHTML + "<li>" + data.RESUMEN_UNIDADES[j].NOMBRE + ": ";
                                    strHTML = strHTML + "<div class='count'><a href='#' onclick='masUnidadTipo(\"" + data.RESUMEN_UNIDADES[j].CODIGO + "\",\"" + currentTipoSearch + "\");return false;'>" + data.RESUMEN_UNIDADES[j].CONTEO + "</a></div>";
                                    strHTML = strHTML + "</li>";
                                }
                                strHTML = strHTML + "</ul>";
                            }
                        }
                        strHTML = strHTML + "";
                        strHTML = strHTML + "";
                        strHTML = strHTML + "";
                        strHTML = strHTML + "";
                        $("#listResultsTipoContenido").html(strHTML);
                        $("#listResultsTipo").show();
                    }
                },
                timeout: 20000,
                error: function (err) {

                }
            });
        }
    }
    if ((currentLetterSearch != null) && (!isTarjeta)) {
        isTarjeta = true;
        var params = {};
        params.letra = currentLetterSearch;
        $("#listResultsLetraHeader").hide();
        $.ajax({
            url: web_service + "/diccionario?cmd=query_resumen_letra",
            data: params,
            type: 'POST',
            success: function (data) {
                if (data.status) {
                    currentCaracterizacion = data;
                    var strHTML = "";
                    strHTML = strHTML + "<h4>Letra " + currentLetterSearch + "</h4>";
                    strHTML = strHTML + "<span>Top&oacute;nimos: " + "<a>" + currentCaracterizacion.TOTAL_NOMBRE + "</a>" + "</span><br/>";
                    strHTML = strHTML + "<span>T&eacute;rminos geogr&aacute;ficos: " + "<a>" + currentCaracterizacion.TOTAL_TIPO + "</a>" + "</span>";

                    var imageUrl;
                    if (currentLetterSearch == "Ñ") {
                        imageUrl = "./images/LETRAS/NTILDE.png";
                    } else {
                        imageUrl = "./images/LETRAS/" + currentLetterSearch + ".png";
                    }
                    $("#listResultsLetraHeader").css("background", "url(" + imageUrl + ")");
                    $("#listResultsLetraHeader").show();

                    strHTML = strHTML + "<hr style='border-top: 1px solid lightgray;'/>";
                    if (currentCaracterizacion.RESUMEN_TIPO != null) {
                        if (currentCaracterizacion.RESUMEN_TIPO.length > 0) {
                            strHTML = strHTML + "<strong>T&eacute;rminos geogr&aacute;ficos m&aacute;s frecuentes:</strong>";
                            strHTML = strHTML + "<ul class='count123' style='padding-left: 15px;'>";
                            for (var j = 0; j < currentCaracterizacion.RESUMEN_TIPO.length; j++) {
                                strHTML = strHTML + "<li>" + currentCaracterizacion.RESUMEN_TIPO[j].TIPO + ": ";
                                strHTML = strHTML + "<div class='count'><a href='#' onclick='masLetraTipo(\"" + currentLetterSearch + "\",\"" + currentCaracterizacion.RESUMEN_TIPO[j].TIPO + "\");return false;'>" + currentCaracterizacion.RESUMEN_TIPO[j].CONTEO + "</a></div>";
                                strHTML = strHTML + "</li>";
                            }
                            strHTML = strHTML + "</ul>";
                        }
                    }
                    if (currentCaracterizacion.RESUMEN_TERMINO != null) {
                        if (currentCaracterizacion.RESUMEN_TERMINO.length > 0) {
                            strHTML = strHTML + "<strong>Top&oacute;nimos m&aacute;s frecuentes:</strong>";
                            strHTML = strHTML + "<ul class='count123' style='padding-left: 15px;'>";
                            for (var j = 0; j < currentCaracterizacion.RESUMEN_TERMINO.length; j++) {
                                strHTML = strHTML + "<li>" + currentCaracterizacion.RESUMEN_TERMINO[j].TIPO + ": ";
                                strHTML = strHTML + "<div class='count'><a href='#' onclick='masLetraTermino(\"" + currentLetterSearch + "\",\"" + currentCaracterizacion.RESUMEN_TERMINO[j].TIPO + "\");return false;'>" + currentCaracterizacion.RESUMEN_TERMINO[j].CONTEO + "</div>" + "</a></li>";
                                strHTML = strHTML + "</li>";
                            }
                            strHTML = strHTML + "</ul>";
                        }
                    }
                    strHTML = strHTML + "";
                    strHTML = strHTML + "";
                    strHTML = strHTML + "";
                    strHTML = strHTML + "";
                    $("#listResultsLetraContenido").html(strHTML);
                    $("#listResultsLetra").show();
                }
            },
            timeout: 20000,
            error: function (err) {

            }
        });
    }
    if (tableSearchTermino == null) {
        tableSearchTermino = $("#tableSearchTermino").DataTable({
            language: spanishDataTable,
            dom: '<"top"<"clear">>rt<"bottom"pil<"clear">>',
            processing: true,
            serverSide: true,
            ajax: {
                url: web_service + "/diccionario",
                deferLoading: 0,
                data: function (d) {
                    d.cmd = "query_termino";
                    if (currentTerminoSearch != null) {
                        d.termino = currentTerminoSearch;
                    }
                    if ((currentUnidadSearch != null) && (currentUnidadSearch != "0")) {
                        d.codigo = currentUnidadSearch;
                    }
                    if (currentTipoSearch != null) {
                        d.tipo = currentTipoSearch;
                    }
                    if (currentLetterSearch != null) {
                        d.letra = currentLetterSearch;
                    }
                },
                dataSrc: function (dataRow) {
                    if (dataRow.TERMINOS_GEO != null) {
                        if (dataRow.TERMINOS_GEO.length > 0) {
                            $("#listResultsTerminosContainer").html("");
                            $("#listResultsTerminosCount").html("T&eacute;rminos geogr&aacute;ficos (" + dataRow.TERMINOS_GEO.length + ")");
                            var strHTML = "";
                            for (var i = 0; i < dataRow.TERMINOS_GEO.length; i++) {
                                strHTML = strHTML + "<h4 style='color: " + getColorByTipo(dataRow.TERMINOS_GEO[i].NOMBRE) + "'>" + dataRow.TERMINOS_GEO[i].NOMBRE.toUpperCase() + "</h4>";
                                strHTML = strHTML + "<div class='media-list media-list-container-termino'>";
                                strHTML = strHTML + "<div class='media'>";

                                strHTML = strHTML + "<div class='media-body media-list-body'>";
                                strHTML = strHTML + "<div class='list-items' style='padding-bottom: 10px;'>";
                                strHTML = strHTML + "</div>";
                                strHTML = strHTML + dataRow.TERMINOS_GEO[i].DEFINICION;
                                strHTML = strHTML + "</div>";

                                strHTML = strHTML + "</div>";
                                strHTML = strHTML + "</div>";

                            }
                            $("#listResultsTerminosContainer").html(strHTML);
                            $("#listResultsTerminosCount").show();
                            $("#listResultsTerminosContainer").show();
                        } else {
                            $("#listResultsTerminosCount").hide();
                            $("#listResultsTerminosContainer").hide();
                        }
                    } else {
                        $("#listResultsTerminosCount").hide();
                        $("#listResultsTerminosContainer").hide();
                    }
                    if (dataRow.TERMINOS_GEO2 != null) {
                        if (dataRow.TERMINOS_GEO2.length > 0) {
                            $("#listResultsTerminos2Container").html("");
                            if (dataRow.TERMINOS_GEO2.length == 1) {
                                $("#listResultsTerminos2Count").html("<i>Encontramos " + dataRow.TERMINOS_GEO2.length + " t&eacute;rminos geogr&aacute;ficos asociados.</i> <a href='#' style='color: black;'onclick='showTerminos2(); return false;'><i>Haz clic para verlos</i></a>");
                            } else {
                                $("#listResultsTerminos2Count").html("<i>Encontramos un t&eacute;rmino geogr&aacute;fico asociado.</i> <a href='#' style='color: black;'onclick='showTerminos2(); return false;'><i>Haz clic para verlo</i></a>");
                            }
                            var strHTML = "";
                            for (var i = 0; i < dataRow.TERMINOS_GEO2.length; i++) {
                                strHTML = strHTML + "<h4 style='color: " + getColorByTipo(dataRow.TERMINOS_GEO2[i].NOMBRE) + "'>" + dataRow.TERMINOS_GEO2[i].NOMBRE.toUpperCase() + "</h4>";
                                strHTML = strHTML + "<div class='media-list media-list-container-termino'>";
                                strHTML = strHTML + "<div class='media'>";

                                strHTML = strHTML + "<div class='media-body media-list-body'>";
                                strHTML = strHTML + "<div class='list-items'>";
                                strHTML = strHTML + "</div>";
                                strHTML = strHTML + dataRow.TERMINOS_GEO2[i].DEFINICION;
                                strHTML = strHTML + "</div>";

                                strHTML = strHTML + "</div>";
                                strHTML = strHTML + "</div>";

                            }
                            $("#listResultsTerminos2Container").html(strHTML);
                            $("#listResultsTerminos2Count").show();
                            $("#listResultsTerminos2Container").hide();
                        } else {
                            $("#listResultsTerminos2Count").hide();
                            $("#listResultsTerminos2Container").hide();
                        }
                    } else {
                        $("#listResultsTerminos2Count").hide();
                        $("#listResultsTerminos2Container").hide();
                    }
                    return dataRow.terminos;
                }
            },
            fnInitComplete: function () {

            },
            drawCallback: function (settings) {
                var api = this.api();
                $("#listResultsContainer").html("");
                if (api.page.info().recordsTotal == 1) {
                    $("#listResultsCount").html("Encontramos un top&oacute;nimo");
                } else {
                    $("#listResultsCount").html("Encontramos " + api.page.info().recordsTotal + " top&oacute;nimos");
                }
                var dataRow = api.rows({ page: 'current' }).data();

                var dataCodigo = null;
                var strHTML = "";
                var currentNombre = null;
                for (var i = 0; i < dataRow.length; i++) {
                    if (dataRow[i].NOMBRE_BUSQUEDA != currentNombre) {
                        currentNombre = dataRow[i].NOMBRE_BUSQUEDA;
                        strHTML = strHTML + "<h4>" + currentNombre + "</h4>";
                    }
                    strHTML = strHTML + "<div class='media-list media-list-container'>";
                    strHTML = strHTML + "<div class='numeracion'>" + (api.page.info().start+i+1) + ".</div>";
                    strHTML = strHTML + "<div class='media'>";

                    if (dataRow[i].CODIGO != null) {
                        if (dataCodigo == null) {
                            dataCodigo = dataRow[i].CODIGO.substring(0, 2);
                        };
                        var imageUrl;
                        imageUrl = "./images/DEPTOS/" + dataRow[i].CODIGO.substring(0, 2) + ".png";
                        strHTML = strHTML + "<div class='media-left' onclick='gotoTermino(" + dataRow[i].ID_NOMBRES_GEO + ");pushState();'>";
                        strHTML = strHTML + "<div>";
                        strHTML = strHTML + "<img class='media-object media-list-object' src='" + imageUrl + "'>";
                        strHTML = strHTML + "</div>";
                        strHTML = strHTML + "</div>";
                    }

                    strHTML = strHTML + "<div class='media-body media-list-body'>";
                    strHTML = strHTML + "<div class='list-items' style='padding-bottom: 10px;'>";
                    if ((dataRow[i].TIPO != null) && (dataRow[i].TIPO != "")) {
                        strHTML = strHTML + "<a href='#' onclick='gotoToponimo(\"" + dataRow[i].TIPO + "\");pushState(); return false;' style='font-weight: bold; filter: brightness(64%) saturate(240%); color: " + getColorByTipo(dataRow[i].TIPO) + ";'>" + dataRow[i].TIPO.toUpperCase() + "</a>&nbsp;";
                    }
                    //strHTML = strHTML + "&nbsp;";
                    if ((dataRow[i].UNIDAD != null) && (dataRow[i].UNIDAD != "")) {
                        strHTML = strHTML + "en <a href='#' style='color: #337ab7; margin-left: 5px; text-decoration: underline;' onclick='masUnidad(\"" + dataRow[i].CODIGO + "\"); return false;'>" + dataRow[i].UNIDAD + "</a>";
                    }
                    strHTML = strHTML + "</div>";

                    strHTML = strHTML + "<div onclick='gotoTermino(" + dataRow[i].ID_NOMBRES_GEO + ");pushState();'>";
                    strHTML = strHTML + dataRow[i].DESCRIPCION;
                    strHTML = strHTML + "</div>";
                    strHTML = strHTML + "</div>";

                    strHTML = strHTML + "</div>";
                    strHTML = strHTML + "</div>";
                }
                $("#listResultsContainer").append(strHTML);
                if ((!isTarjeta) && (dataCodigo != null)) {
                    var params = {};
                    params.tipo = "DEPTO";
                    params.id = dataCodigo;
                    $("#listResultsUnidadHeader").hide();
                    $("#listResultsUnidadHeaderImg").hide();
                    $.ajax({
                        url: web_service + "/diccionario?cmd=query_resumen_unidad",
                        data: params,
                        type: 'POST',
                        success: function (data) {
                            if (data.status) {
                                updateTarjetaUnidadHeader(data);
                                updateTarjetaUnidad(data);
                            }
                        },
                        timeout: 20000,
                        error: function (err) {

                        }
                    });
                }
            },
            columns: [
                {
                    orderable: false,
                    data: "ID_NOMBRES_GEO"
                },
                {
                    data: "NOMBRE",
                }
            ]
        });
    } else {
        tableSearchTermino.ajax.reload();
    }
}

function showTerminos2() {
    $("#listResultsTerminos2Container").show();
}

function updateTarjetaUnidadHeader(data) {
    currentCaracterizacion = data;
    var strHTML = "";
    strHTML = strHTML + "<h4 class='title'>" + currentCaracterizacion.NOMBRE + "</h4>";
    strHTML = strHTML + "<span>Top&oacute;nimos: " + "<a>" + currentCaracterizacion.TOTAL_NOMBRE + "</a>" + "</span><br/>";
    strHTML = strHTML + "<span>T&eacute;rminos geogr&aacute;ficos: " + "<a>" + currentCaracterizacion.TOTAL_TIPO + "</a>" + "</span>";
    $("#listResultsUnidadContenido2").html(strHTML);
    $("#listResultsUnidad").show();
}

function updateTarjetaUnidad(data) {
    currentCaracterizacion = data;
    var strHTML = "";
    try {
        var extentCaracterizacion = null;
        if (currentCaracterizacion.SHAPE != null) {
            extentCaracterizacion = esri.jsonUtilsGeometry.fromJson(Terraformer.ArcGIS.convert(new Terraformer.Primitive(JSON.parse(currentCaracterizacion.SHAPE))));
        } else {
            extentCaracterizacion = esri.Polygon.fromExtent(default_extent);
        }
        if (extentCaracterizacion != null) {
            var thumbExtent = extentCaracterizacion.getExtent();
            var imageUrl = thumbnail_geodesia_service + "bboxSR=4326&layers=&layerDefs=&size=480,240&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&datumTransformations=&layerParameterValues=&mapRangeValues=&layerRangeValues=&f=image&bbox=" +
                thumbExtent.xmin + "%2C" +
                thumbExtent.ymin + "%2C" +
                thumbExtent.xmax + "%2C" +
                thumbExtent.ymax;
            listResultsUnidadHeader.setExtent(thumbExtent);
            //$("#listResultsUnidadHeader").css("background", "url(" + imageUrl + ")");
            $("#listResultsUnidadHeader").show();
        }
    } catch (err) {

    }


    if (currentCaracterizacion.CODIGO != null) {
        $("#listResultsUnidadHeaderImg").attr("src", "../images/DEPTOS/" + currentCaracterizacion.CODIGO.substring(0, 2) + ".png");
        $("#listResultsUnidadHeaderImg").show();
    }

    strHTML = strHTML + "<div class='fulllist'>";
    if (currentCaracterizacion.RESUMEN_TIPO != null) {
        if (currentCaracterizacion.RESUMEN_TIPO.length > 0) {
            strHTML = strHTML + "<strong>T&eacute;rminos geogr&aacute;ficos m&aacute;s frecuentes:</strong>";
            strHTML = strHTML + "<ul class='count123' style='padding-left: 30px;'>";
            for (var j = 0; j < currentCaracterizacion.RESUMEN_TIPO.length; j++) {
                strHTML = strHTML + "<li>" + currentCaracterizacion.RESUMEN_TIPO[j].TIPO + ": ";
                strHTML = strHTML + "<div class='count'><a href='#' onclick='masUnidadTipo(\"" + currentCaracterizacion.CODIGO + "\",\"" + currentCaracterizacion.RESUMEN_TIPO[j].TIPO + "\");return false;'>" + currentCaracterizacion.RESUMEN_TIPO[j].CONTEO + "</a></div>";
                strHTML = strHTML + "</li>";
            }
            strHTML = strHTML + "</ul>";
        }
    }
    if (currentCaracterizacion.RESUMEN_NOMBRE != null) {
        if (currentCaracterizacion.RESUMEN_NOMBRE.length > 0) {
            strHTML = strHTML + "<strong>Top&oacute;nimos m&aacute;s frecuentes:</strong>";
            strHTML = strHTML + "<ul class='count123' style='padding-left: 30px;'>";
            for (var j = 0; j < currentCaracterizacion.RESUMEN_NOMBRE.length; j++) {
                strHTML = strHTML + "<li>" + currentCaracterizacion.RESUMEN_NOMBRE[j].TIPO + ": ";
                strHTML = strHTML + "<div class='count'><a href='#' onclick='masUnidadTermino(\"" + currentCaracterizacion.CODIGO + "\",\"" + currentCaracterizacion.RESUMEN_NOMBRE[j].TIPO + "\");return false;'>" + currentCaracterizacion.RESUMEN_NOMBRE[j].CONTEO + "</a></div>";
                strHTML = strHTML + "</li>";
            }
            strHTML = strHTML + "</ul>";
            strHTML = strHTML + "<br>";
        }
    }
    strHTML = strHTML + "</div>";
    strHTML = strHTML + "<div class='content-botones'>";
    //strHTML = strHTML + "<div class='botones-tarjeta'><button onclick='masUnidad(null);' class='masde'>M&aacute;s de " + currentCaracterizacion.NOMBRE + "</button></div>"
    strHTML = strHTML + "<div class='botones-tarjeta'><button onclick='openCEM();'>Más info. en Colombia en Mapas</button></div>"
    strHTML = strHTML + "</div>";
    strHTML = strHTML + "";
    strHTML = strHTML + "";
    strHTML = strHTML + "";
    strHTML = strHTML + "";
    $("#listResultsUnidadContenido").html(strHTML);
    $("#listResultsUnidad").show();
}

function updateSearch() {
    updateFiltros();
    if ((currentUnidadSearch == null) &&
        (currentTerminoSearch == null) &&
        (currentTipoSearch == null) &&
        (currentLetterSearch == null)) {
        minAll();
        $("#homeDiv").show();
        $("html, body").animate({ scrollTop: 0 });
        $("#searchFiltro").val(null);
        $("#searchFiltro").trigger("change.select2");
        $("#searchFiltroTipo").val(null);
        $("#searchFiltroTipo").trigger("change.select2");
        $("#searchFiltroLetra").val(null);
        $("#searchFiltroLetra").trigger("change.select2");
    } else {
        gotoTerminoSearch();
    }
    pushState();
}

function updateFiltros() {
    var strHTML = "";
    var filtrosCounter = 0;
    $("#filtrosBar").html("");
    if (($('.searchCtrl2').val() != null) && ($('.searchCtrl2').val() != "")) {
        currentTerminoSearch = $('.searchCtrl2').val();
        strHTML = strHTML + "<span class='label label-default'>" + currentTerminoSearch + "&nbsp;<span onclick='clearTermino();'>×</span></span>&nbsp;&nbsp;";
        filtrosCounter = filtrosCounter + 1;
    } else {
        currentTerminoSearch = null;
    }
    if ($("#searchFiltro").val() != null) {
        currentUnidadSearch = $("#searchFiltro").val();
        strHTML = strHTML + "<span class='label label-default'>" + $("#searchFiltro").select2("data")[0].text + "&nbsp;<span onclick='clearUnidad();'>×</span></span>&nbsp;&nbsp;";
        filtrosCounter = filtrosCounter + 1;
    } else {
        currentUnidadSearch = null;
    }
    if ($("#searchFiltroTipo").val() != null) {
        if ($("#searchFiltroTipo").val().length == 0) {
            currentTipoSearch = null;
        } else {
            currentTipoSearch = $("#searchFiltroTipo").val().join(";");
            for (var i = 0; i < $("#searchFiltroTipo").val().length; i++) {
                strHTML = strHTML + "<span class='label label-default' style='background-color: " + getColorByTipo($("#searchFiltroTipo").val()[i]) + "'>" + $("#searchFiltroTipo").val()[i] + "&nbsp;<span onclick='clearTipo(\"" + $("#searchFiltroTipo").val()[i] + "\");' style='color: white;'>×</span></span>&nbsp;&nbsp;";
                filtrosCounter = filtrosCounter + 1;
            }
        }
    } else {
        currentTipoSearch = null;
    }
    if ($("#searchFiltroLetra").val() != null) {
        currentLetterSearch = $("#searchFiltroLetra").val();
        strHTML = strHTML + "<span class='label label-default'>" + currentLetterSearch + "&nbsp;<span onclick='clearLetra();'><p>×</p></span></span>&nbsp;&nbsp;";
        filtrosCounter = filtrosCounter + 1;
    } else {
        currentLetterSearch = null;
    }
    $("#filtrosBar").html(strHTML);
    if ((currentTerminoSearch == null) && (currentUnidadSearch == null) && (currentTipoSearch == null) && (currentLetterSearch == null)) {
        $("#filtrosBarLimpiar").hide();
    } else {
        $("#filtrosBarLimpiar").show();
    }
    if (filtrosCounter > 0) {
        if (filtrosCounter == 1) {
            $(".searchLabel").html(filtrosCounter + " filtro aplicado");
        } else {
            $(".searchLabel").html(filtrosCounter + " filtros aplicados");
        }
    } else {
        $(".searchLabel").html("Empieza tu búsqueda");
    }
}

function clearTermino() {
    currentTerminoSearch = null;
    $("html, body").animate({ scrollTop: 0 });
    $('.searchCtrl2').val(null);
    updateSearch();
}


function clearUnidad() {
    currentUnidadSearch = null;
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltro").val(null);
    $("#searchFiltro").trigger("change.select2");
    updateSearch();
}

function clearTipo(id) {
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltroTipo").val(currentTipoSearch.split(";").filter(function (value) {
        return value != id;
    }));
    if ($("#searchFiltroTipo").val().length == 0) {
        currentTipoSearch = null;
    }
    $("#searchFiltroTipo").trigger("change.select2");
    updateSearch();
}

function clearLetra() {
    currentLetterSearch = null;
    $("html, body").animate({ scrollTop: 0 });
    $("#searchFiltroLetra").val(null);
    $("#searchFiltroLetra").trigger("change.select2");
    updateSearch();
}

function limpiarFiltros() {
    currentUnidadSearch = null;
    currentTipoSearch = null;
    currentLetterSearch = null;
    $("html, body").animate({ scrollTop: 0 });
    $("#inpout1").val(null);
    $("#input2").val(null);
    $("#searchFiltro").val(null);
    $("#searchFiltro").trigger("change.select2");
    $("#searchFiltroTipo").val(null);
    $("#searchFiltroTipo").trigger("change.select2");
    $("#searchFiltroLetra").val(null);
    $("#searchFiltroLetra").trigger("change.select2");
    updateSearch();
}


function gotoLogin() {
    if (currentUser == null) {
        signIn();
    } else {
        $("#loginContainer").hide();
        $("#logoutContainer").show();
    }
    $("#modalLogin").modal("show");
}

function closeLogin() {
    $("#modalLogin").modal("hide");
}

function validateForm() {
    $("#modalForm").modal("show");
}

function shareLink() {
    var url = encodeURI(getShareUrl());
    Clipboard.copy(url);
    $(".tooltip-arrowX").css("border-right-color", "#6CD47C");
    $(".tooltip-innerX").css("background-color", "#6CD47C");
    $(".tooltip-innerX").html("El Link ha sido copiado");
    reporteUso("Copiar enlace");
}

function getShareUrl() {
    var url = "";
    if ($("#searchDiv").is(":visible")) {
        if (currentTerminoSearch != null) {
            if (url != "") {
                url = url + "&";
            }
            if (url == "") {
                url = url + "query=" + currentTerminoSearch;
            }
        }
        if (currentUnidadSearch != null) {
            if (url != "") {
                url = url + "&";
            }
            url = url + "unidad=" + currentUnidadSearch;
        }
        if (currentTipoSearch != null) {
            if (url != "") {
                url = url + "&";
            }
            url = url + "tipo=" + currentTipoSearch;
        }
        if (currentLetterSearch != null) {
            if (url != "") {
                url = url + "&";
            }
            url = url + "letra=" + currentLetterSearch;
        }
    }
    if ($("#letterDiv").is(":visible")) {
        url = url + "_letra=" + currentLetter;
    }
    if ($("#terminoDiv").is(":visible")) {
        url = url + "_termino=" + currentTermino;
    }
    if ($("#toponimoDiv").is(":visible")) {
        url = url + "_toponimo=" + currentToponimo;
    }
    if (url != "") {
        url = "?" + url;
    }
    return window.location.origin + window.location.pathname + url;
}

function initData(data) {

    cacheUnidades = data.UNIDAD;
    cacheUnidadesFiltro = data.UNIDAD;
    cacheTerminos = data.TIPO;
    $("#searchFiltro").select2({
        data: cacheUnidadesFiltro,
        multiple: false,
        allowClear: true,
        placeholder: "Ej: Colombia",
        query: function (query) {
            if ((query.term == null) || (query.term == "")) {
                query.callback({ results: cacheUnidadesFiltro });
            } else {
                var results = [];
                for (var i = 0; i < cacheUnidadesFiltro.length; i++) {
                    if (limpiarTexto(cacheUnidadesFiltro[i].text).indexOf(limpiarTexto(query.term)) != -1) {
                        if (cacheUnidadesFiltro[i].type == "MUNI") {
                            results.push({
                                type: cacheUnidadesFiltro[i].type,
                                id: cacheUnidadesFiltro[i].id,
                                text: cacheUnidadesFiltro[i].text + ", " + getDeptoByMuni(cacheUnidadesFiltro[i].id).text
                            });
                        } else {
                            results.push({
                                type: cacheUnidadesFiltro[i].type,
                                id: cacheUnidadesFiltro[i].id,
                                text: cacheUnidadesFiltro[i].text
                            });
                        }
                    }
                }
                query.callback({ results: results });
            }
        },
        templateResult: function (data) {
            if (!data.type) {
                return data.text;
            }
            return $("<span class='" + data.type + "'>" + data.text + "</span>");
        }
    });
    $("#searchFiltro").val(null);
    $("#searchFiltro").trigger("change");
    $("#searchFiltro").on("change", function (e) {
        updateSearch();
    });


    var dataTipo = [];
    if (getParameterByName("tipo") != null) {
        dataTipo = getParameterByName("tipo").split(";");
        for (var i = 0; i < dataTipo.length; i++) {
            dataTipo[i] = { id: dataTipo[i], text: dataTipo[i] };
        }
    }
    $("#searchFiltroTipo").select2({
        data: data.TIPO,
        multiple: true,
        placeholder: "Ej: Sitio",
        templateSelection: function (data) {
            return $("<span class='class-tag' item-tag='" + data.text + "'>" + data.text + "</span>");
        }
    });
    $("#searchFiltroTipo").on("change", function (e) {
        updateTags();
        updateSearch();
    });

    var dataLetra = [];
    for (var i = 0; i < letraArray.length; i++) {
        dataLetra.push({ id: letraArray[i], text: letraArray[i] });
    }
    $("#searchFiltroLetra").select2({
        data: dataLetra,
        allowClear: true,
        placeholder: "Ej: A, B, C"
    });
    $("#searchFiltroLetra").val(null);
    $("#searchFiltroLetra").trigger("change");
    $("#searchFiltroLetra").on("change", function (e) {
        updateSearch();
    });

    updateParametros();
}

function updateTags() {
    $(".class-tag").each(function (index, value) {
        $(value).parent().css("background-color", getColorByTipo($(value).attr("item-tag")));
        $(value).parent().find(".select2-selection__choice__remove").css("color", "white");
        $(value).css("color", "white");
    });
}

function copyShareLink() {
    Clipboard.copy($("#urlShare").val());
}

function reporteUso(funcionalidad, parametro) {
    if (parametro == null) {        
        try {
            gtag('event', funcionalidad, {
                'send_to': 'UA-177680669-1',
                'event_category': funcionalidad
            });
        } catch (err) {
            console.log(err);
        }
        return;
    }
    var value = null;
    if (parametro.unidad != null) {
        value = parametro.unidad;
    }
    if (parametro.termino != null) {
        value = parametro.termino;
    }
    if (parametro.toponimo != null) {
        value = parametro.toponimo;
    }
    try {
        gtag('event', funcionalidad, {
            'send_to': 'UA-177680669-1',
            'event_category': funcionalidad,
            'event_action': parametro.action,
            'event_label': value,
        });
    } catch (err) {

    }
}

function checkURL(url, mostrarAlerta) {
    var pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");
    if (pattern.test(url)) {
        return true;
    } else {
        if (mostrarAlerta) {
            showLoading("La URL ingresada no es valida", null, "red", true);
        }
        return false;
    }
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

function initMap() {
    require([
        "esri/map",
        "esri/basemaps",
        "esri/layers/GraphicsLayer",

        "esri/geometry/Point",
        "esri/geometry/Circle",
        "esri/geometry/Polyline",
        "esri/geometry/Polygon",
        "esri/geometry/Extent",

        "esri/geometry/webMercatorUtils",
        "esri/geometry/geometryEngine",
        "esri/geometry/jsonUtils",

        "esri/symbols/PictureMarkerSymbol",

        "esri/dijit/LocateButton",
        "esri/dijit/HomeButton",
        "esri/dijit/Scalebar"
    ], function (
        __Map,
        __Basemaps,
        __GraphicsLayer,

        __Point,
        __Circle,
        __Polyline,
        __Polygon,
        __Extent,

        __webMercatorUtils,
        __geometryEngine,
        __jsonUtilsGeometry,

        __PictureMarkerSymbol,

        __LocateButton,
        __HomeButton,
        __Scalebar) {

        esri.Map = __Map;
        esri.Basemaps = __Basemaps;
        esri.GraphicsLayer = __GraphicsLayer;

        esri.Point = __Point;
        esri.Circle = __Circle;
        esri.Polyline = __Polyline;
        esri.Polygon = __Polygon;
        esri.Extent = __Extent;

        esri.webMercatorUtils = __webMercatorUtils;
        esri.geometryEngine = __geometryEngine;
        esri.jsonUtilsGeometry = __jsonUtilsGeometry;

        esri.PictureMarkerSymbol = __PictureMarkerSymbol;
        esri.LocateButton = __LocateButton;
        esri.HomeButton = __HomeButton;
        esri.Scalebar = __Scalebar;

        esri.basemaps.igac = {
            layers: [
                { type: "VectorTile", url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_base_topografico/VectorTileServer" }
            ],
            title: "Mapa Topográfico Colombia"
        };
        esri.basemaps.igachibrido = {
            layers: [
                { url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_Hibrido/MapServer" }
            ],
            title: "Mapa Híbrido Colombia"
        };
        esri.basemaps.igacsatelital = {
            layers: [
                { url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_Satelital/MapServer" }
            ],
            title: "Mapa Satelital Colombia"
        };
        esri.basemaps.igacfisico = {
            layers: [
                { url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_Fisico_Relieve/MapServer" },
                { type: "VectorTile", url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_base_fisico_vector/VectorTileServer" }
            ],
            title: "Mapa Físico Colombia"
        };
        esri.basemaps.igacterreno = {
            layers: [
                { url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/MapaBaseTerreno/MapServer" },
                { type: "VectorTile", url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/MapaBaseTerrenoVector/VectorTileServer" }
            ],
            title: "Mapa Terreno Colombia"
        };
        esri.basemaps.igaclonanegra = {
            baseMapLayers: [
                { type: "VectorTile", url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/MapaLonaNegra/VectorTileServer" }
            ],
            title: "Mapa Lona Negra Colombia"
        };
        esri.basemaps.igaclonaazul = {
            baseMapLayers: [
                { type: "VectorTile", url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/MapaLonaAzul/VectorTileServer" }
            ],
            title: "Mapa Lona Azul Colombia"
        };

        var strGalleryHTML = "";
        var strGalleryHTML1 = "";
        for (var prop in esri.basemaps) {
            if (Object.prototype.hasOwnProperty.call(esri.basemaps, prop)) {
                if (prop.startsWith("igac")) {
                    strGalleryHTML = strGalleryHTML + "<a class='link-gallery' href='#'>" + esri.basemaps[prop].title + "</a><br />";
                    strGalleryHTML1 = strGalleryHTML1 + "<a class='link-gallery-1' href='#'>" + esri.basemaps[prop].title + "</a><br />";
                }
            }
        }

        default_extent = new esri.Extent({ "xmin": -9483298.846686536, "ymin": -421598.0260950668, "xmax": -6743795.752946549, "ymax": 1535189.898004925, "spatialReference": { "wkid": 102100, "latestWkid": 3857 } });

        default_extent = new esri.Extent({
                xmin: -86.25559680664145, ymin: -4.496767298712775, xmax: -62.239483525397816, ymax: 14.437589074108095,
                spatialReference: {
                    wkid: 4326
                }
            });
        listResultsUnidadHeader = new esri.Map("listResultsUnidadHeader", {
            basemap: "igac",
            extent: default_extent,
            maxZoom: 19,
            minZoom: 4,
            showLabels: false
        });
        terminoResultsUnidadHeader = new esri.Map("terminoResultsUnidadHeader", {
            basemap: "igac",
            extent: default_extent,
            maxZoom: 19,
            minZoom: 4,
            showLabels: false
        });
        ngAddMap = new esri.Map("ngAddMap", {
            basemap: "igac",
            center: { "x": -8128223.209247294, "y": 444280.6303191796, "spatialReference": { "wkid": 102100, "latestWkid": 3857 } },
            maxZoom: 19,
            minZoom: 4,
            showLabels: false
        });
        
        locateBtn = new esri.LocateButton({
            map: ngAddMap,
            scale: 25000,
        }, "locateButton");
        locateBtn.startup();
        homeBtn = new esri.HomeButton({
            map: ngAddMap
        }, "homeButton");
        homeBtn.startup();
        scalebar = new esri.Scalebar({
            map: ngAddMap,
            scalebarUnit: "metric",
            attachTo: "bottom-right",
            scalebarStyle: "line"
        }, $("#ngAddMap .esriControlsBR")[0]);        
        $("#basemapGalleryButton").popover({
            container: "body",
            placement: "left",
            trigger: "manual",
            html: true,
            content: strGalleryHTML
        });        
        $("#basemapGalleryButton").on("shown.bs.popover", function () {
            $(".link-gallery").unbind("click");
            $(".link-gallery").on("click", function () {                
                for (var prop in esri.basemaps) {
                    if (Object.prototype.hasOwnProperty.call(esri.basemaps, prop)) {
                        if (esri.basemaps[prop].title == $(this).text()) {
                            ngAddMap.setBasemap(prop);
                        }
                    }
                }
                $("#basemapGalleryButton").popover("hide");
                return false;
            });            
        });

        locateBtn1 = new esri.LocateButton({
            map: terminoResultsUnidadHeader,
            scale: 25000,
        }, "locateButton1");
        locateBtn.startup();
        homeBtn1 = new esri.HomeButton({
            map: terminoResultsUnidadHeader
        }, "homeButton1");
        homeBtn1.startup();
        scalebar1 = new esri.Scalebar({
            map: terminoResultsUnidadHeader,
            scalebarUnit: "metric",
            attachTo: "bottom-right",
            scalebarStyle: "line"
        }, $("#terminoResultsUnidadHeader .esriControlsBR")[0]);
        $("#basemapGalleryButton1").popover({
            container: "body",
            placement: "left",
            trigger: "manual",
            html: true,
            content: strGalleryHTML1
        });
        $("#basemapGalleryButton1").on("shown.bs.popover", function () {
            $(".link-gallery-1").unbind("click");
            $(".link-gallery-1").on("click", function () {
                for (var prop in esri.basemaps) {
                    if (Object.prototype.hasOwnProperty.call(esri.basemaps, prop)) {
                        if (esri.basemaps[prop].title == $(this).text()) {
                            terminoResultsUnidadHeader.setBasemap(prop);
                        }
                    }
                }
                $("#basemapGalleryButton1").popover("hide");
                return false;
            });
        });

        glPoint = new esri.GraphicsLayer();
        ngAddMap.addLayer(glPoint);
        ngAddMap.on("resize", function () {
            resizeCenter = ngAddMap.extent.getCenter();
            setTimeout(function () {
                ngAddMap.centerAt(resizeCenter);
            }, 100);
        });

        ngAddMap.on("extent-change", function (evt) {
            glPoint.clear();
            glPoint.add(new esri.Graphic(ngAddMap.extent.getCenter(), redMarker), null, null);
            var from = sistemasCoordenadas["EPSG:3857"].proj;
            var to = sistemasCoordenadas[$("#ngaddCoordenada").val()].proj;
            var reprojectedCoordsNew = proj4(from, to, [ngAddMap.extent.getCenter().x, ngAddMap.extent.getCenter().y]);
            $("#ngaddX").val(reprojectedCoordsNew[1]);
            $("#ngaddY").val(reprojectedCoordsNew[0]);
            updateCoordenada();
        });
        redMarker = new esri.PictureMarkerSymbol("./images/iconos/Pin_Red.png", 21, 30);
    });
}

function updateParametros() {
    if (firstParameters) {
        firstParameters = false;

        if ((getParameterByName("query") != null) ||
            (getParameterByName("unidad") != null) ||
            (getParameterByName("letra") != null) ||
            (getParameterByName("tipo") != null)) {
            if (getParameterByName("query") != null) {
                currentTerminoSearch = getParameterByName("query");
                $('.searchCtrl2').val(currentTerminoSearch);
            }
            if (getParameterByName("unidad") != null) {
                currentUnidadSearch = getParameterByName("unidad");
                $("#searchFiltro").val(currentUnidadSearch);
                $("#searchFiltro").trigger("change.select2");
            }
            if (getParameterByName("tipo") != null) {
                currentTipoSearch = getParameterByName("tipo");
                $("#searchFiltroTipo").val(currentTipoSearch.split(";"));
                $("#searchFiltroTipo").trigger("change.select2");
                updateTags();
            }
            if (getParameterByName("letra") != null) {
                currentLetterSearch = getParameterByName("letra");
                $("#searchFiltroLetra").val(currentLetterSearch);
                $("#searchFiltroLetra").trigger("change.select2");
            }
            updateSearch();
            return;
        }
        if (getParameterByName("_letra") != null) {
            gotoLetter(getParameterByName("_letra"));
            return;
        }
        if (getParameterByName("_termino") != null) {
            gotoTermino(getParameterByName("_termino"));
            return;
        }
        if (getParameterByName("_toponimo") != null) {
            gotoToponimo(getParameterByName("_toponimo"));
            return;
        }


    }
}

function getDeptoByMuni(id) {
    for (var i = 0; i < cacheUnidades.length; i++) {
        if (cacheUnidades[i].type == "DEPTO") {
            if (id.startsWith(cacheUnidades[i].id)) {
                return cacheUnidades[i];
            }
        }
    }
    return null;
}

function getUnidadById(id) {
    for (var i = 0; i < cacheUnidades.length; i++) {
        if (cacheUnidades[i].id == id) {
            return cacheUnidades[i];
        }
    }
}

function getColorByTipo(tipo) {
    for (var i = 0; i < colores_tipo.length; i++) {
        if (colores_tipo[i].tipo == tipo) {
            return "#" + colores_tipo[i].color;
        }
    }
    return "#777777";
}

var colores_tipo = [
    { "tipo": "Sitio", "color": "6BDBB7" },
    { "tipo": "Quebrada", "color": "33B7B7" },
    { "tipo": "Caserío", "color": "007D82" },
    { "tipo": "Vereda", "color": "009075" },
    { "tipo": "Caño", "color": "00A586" },
    { "tipo": "Arroyo", "color": "DCDA00" },
    { "tipo": "Loma", "color": "93BF1F" },
    { "tipo": "Alto", "color": "f4a833" },
    { "tipo": "Cerro", "color": "008B36" },
    { "tipo": "Río", "color": "006633" },
    { "tipo": "Cuchilla", "color": "58CCFB" },
    { "tipo": "Corregimiento", "color": "5193FC" },
    { "tipo": "Ciénaga", "color": "3268DF" },
    { "tipo": "Inspección de Policía", "color": "3595E0 " },
    { "tipo": "Cañada", "color": "0069B3" },
    { "tipo": "Laguna", "color": "1E4A93" },
    { "tipo": "Isla", "color": "57A1BF" },
    { "tipo": "Municipio", "color": "FEE561" },
    { "tipo": "Nombre", "color": "FACE33" },
    { "tipo": "Reserva Natural de la Sociedad Civil", "color": "F4A833" },
    { "tipo": "Resguardo Indígena", "color": "EA4B33" },
    { "tipo": "Estero", "color": "E94258" },
    { "tipo": "Punta", "color": "CF394B" },
    { "tipo": "Filo", "color": "EB8CEF" },
    { "tipo": "Aeropuerto", "color": "B64FDD" },
    { "tipo": "Zanjón", "color": "8D338A" },
    { "tipo": "Páramo", "color": "6445E1." },
    { "tipo": "Morro", "color": "532D96" },
    { "tipo": "Peña", "color": "F1A5A7" },
    { "tipo": "Sabana", "color": "E751BF" },
    { "tipo": "Playón", "color": "E9467F" },
    { "tipo": "Brazo", "color": "874F43" },
    { "tipo": "Ramal", "color": "89E2C5" },
    { "tipo": "Título Colectivo", "color": "5CC5C5" },
    { "tipo": "Serranía", "color": "33979B" },
    { "tipo": "Raudal", "color": "33A691" },
    { "tipo": "Poza", "color": "33B79E" },
    { "tipo": "Jagüey", "color": "E3E133" },
    { "tipo": "Boca", "color": "A9CC4C" },
    { "tipo": "Pico", "color": "59BB85" },
    { "tipo": "Distrito Regional de Manejo Integrado", "color": "33A25E" },
    { "tipo": "Bajo", "color": "33855C" },
    { "tipo": "Playa", "color": "79D6FC" },
    { "tipo": "Reserva Forestal Protectora Regional", "color": "79D6FC" },
    { "tipo": "Bahía", "color": "5B86E5" },
    { "tipo": "Puente", "color": "5DAAE6" },
    { "tipo": "Central Eléctrica", "color": "3387C2" },
    { "tipo": "Mesa", "color": "4B6EA9" },
    { "tipo": "Reserva Forestal Protectora Nacional", "color": "79B4CC" },
    { "tipo": "Ensenada", "color": "FEEA81" },
    { "tipo": "Pozo", "color": "FBD85C" },
    { "tipo": "Canal", "color": "F6B95C" },
    { "tipo": "Bocana", "color": "EE6F5C" },
    { "tipo": "Cabecera", "color": "ED6879" },
    { "tipo": "Embalse", "color": "D9616F" },
    { "tipo": "Boquerón", "color": "EFA3F2" },
    { "tipo": "Parque Nacional Natural", "color": "C572E4" },
    { "tipo": "Chorro", "color": "A45CA1" },
    { "tipo": "Colina", "color": "7B59E4" },
    { "tipo": "Departamento", "color": "7557AB" },
    { "tipo": "Cayo", "color": "F4B7B9" },
    { "tipo": "Sierra", "color": "EC74CC" },
    { "tipo": "Meseta", "color": "ED6B99" },
    { "tipo": "Acequia", "color": "9F7269" },
    { "tipo": "Rápido", "color": "A6E9D4" },
    { "tipo": "Zanja", "color": "85D4D4" },
    { "tipo": "Pantano", "color": "66B1B4" },
    { "tipo": "Lago", "color": "66BCAC" },
    { "tipo": "Ranchería Indígena", "color": "66C9B6" },
    { "tipo": "Corregimiento Departamental", "color": "EAE966" },
    { "tipo": "Localidad", "color": "BED979" },
    { "tipo": "Valle", "color": "82CCA3" },
    { "tipo": "Montaña", "color": "66B986" },
    { "tipo": "Volcán", "color": "66A385" },
    { "tipo": "Peñón", "color": "9BE0FD" },
    { "tipo": "Brazuelo", "color": "9BE0FD" },
    { "tipo": "Madre Vieja", "color": "84A4EC" },
    { "tipo": "Islote", "color": "86BFEC" },
    { "tipo": "Llano", "color": "66A5D1" },
    { "tipo": "Distrito de Conservación de Suelos", "color": "7892BE" },
    { "tipo": "Salto", "color": "9AC7D9" },
    { "tipo": "Cabo", "color": "FEEFA0" },
    { "tipo": "Monte", "color": "FCE285" },
    { "tipo": "Represa", "color": "F8CB85" },
    { "tipo": "Salina", "color": "F29385" },
    { "tipo": "Área de Recreación", "color": "F28E9B" },
    { "tipo": "Cañón", "color": "E28893" },
    { "tipo": "Santuario de Fauna y Flora", "color": "F3BAF5" },
    { "tipo": "Parque Arqueológico", "color": "D395EB" },
    { "tipo": "Nevado", "color": "BB85B9" },
    { "tipo": "Rincón", "color": "9C83EB" },
    { "tipo": "Parque Natural Regional", "color": "9881C0" },
    { "tipo": "Caleta", "color": "F7C9CA" },
    { "tipo": "Depresión", "color": "F197D9" },
    { "tipo": "Farallones", "color": "F290B2" },
    { "tipo": "Cueva", "color": "B7958E" },
    { "tipo": "Rocas", "color": "C4F1E2" },
    { "tipo": "Contrafuerte", "color": "ADE2E2" },
    { "tipo": "Faro", "color": "99CBCD" },
    { "tipo": "Archipiélago", "color": "99D3C8" },
    { "tipo": "Golfo", "color": "99DBCF" },
    { "tipo": "Nudo", "color": "F1F099" },
    { "tipo": "Subregión", "color": "D4E5A5" },
    { "tipo": "Cascada", "color": "ACDDC2" },
    { "tipo": "Región Geográfica", "color": "99D1AF" },
    { "tipo": "Área metropolitana", "color": "99C2AD" },
    { "tipo": "Abanico", "color": "BCEBFD" },
    { "tipo": "Puerto", "color": "BCEBFD" },
    { "tipo": "Distrito Nacional de Manejo Integrado", "color": "ADC3F2" },
    { "tipo": "Altiplano", "color": "AED5F3" },
    { "tipo": "Centro Poblado", "color": "99C3E1" },
    { "tipo": "Reserva Natural", "color": "6445e1" },
    { "tipo": "Paso", "color": "BCD9E5" },
    { "tipo": "Arrecife", "color": "FFF5C0" },
    { "tipo": "Arenal", "color": "FDEBAD" },
    { "tipo": "Volcán Nevado", "color": "FBDCAD" },
    { "tipo": "Piedra", "color": "F7B7AD" },
    { "tipo": "Desembocadura", "color": "F6B3BC" },
    { "tipo": "Istmo", "color": "ECB0B7" },
    { "tipo": "Cráter", "color": "F7D1F9" },
    { "tipo": "Cuesta", "color": "E2B9F1" },
    { "tipo": "Picacho", "color": "D1ADD0" },
    { "tipo": "Cordillera", "color": "BDACF1" },
    { "tipo": "Cima", "color": "BAABD5" },
    { "tipo": "Ladera", "color": "F9DBDC" },
    { "tipo": "Reserva Nacional Natural", "color": "F5B9E5" },
    { "tipo": "Banco", "color": "F6B5CC" },
    { "tipo": "Rada", "color": "CFB9B4" },
    { "tipo": "Sierra Nevada", "color": "C4F1E2" },
    { "tipo": "Costa", "color": "ADE2E2" },
    { "tipo": "Océano", "color": "99CBCD" },
    { "tipo": "Distrito Turístico y Cultural", "color": "99D3C8" },
    { "tipo": "Delta", "color": "99DBCF" },
    { "tipo": "Distrito Especial, Deportivo, Cultural, Turístico, Empresarial y de Servicios", "color": "F1F099" },
    { "tipo": "Distrito Especial, Turístico y Cultural", "color": "D4E5A5" },
    { "tipo": "Distrito Capital", "color": "ACDDC2" },
    { "tipo": "Macizo", "color": "99D1AF" },
    { "tipo": "Distrito Turístico, Cultural e Histórico", "color": "99C2AD" },
    { "tipo": "Malecón", "color": "BCEBFD" },
    { "tipo": "Riscos", "color": "BCEBFD" },
    { "tipo": "Capital", "color": "ADC3F2" },
    { "tipo": "Santuario de Fauna", "color": "AED5F3" },
    { "tipo": "Distrito Especial, Industrial y Portuario", "color": "99C3E1" },
    { "tipo": "Península", "color": "6445e1" },
    { "tipo": "Vía Parque", "color": "BCD9E5" },
    { "tipo": "Distrito Especial, Industrial, Portuario, Biodeverso y Ecoturístico", "color": "FFF5C0" },
    { "tipo": "República", "color": "FDEBAD" },
    { "tipo": "Santuario de Flora", "color": "FBDCAD" },
    { "tipo": "Mar", "color": "F7B7AD" },
    { "tipo": "Enclave Climático", "color": "F6B3BC" },
    { "tipo": "Espolón", "color": "ECB0B7" },
    { "tipo": "Área Natural Única", "color": "F7D1F9" }
];

var sistemasCoordenadas = {
    "EPSG:9377": {
        "proj": '+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkt": 'PROJCS["MAGNA-SIRGAS / CTM12",GEOGCS["MAGNA-SIRGAS",DATUM["Marco_Geocentrico_Nacional_de_Referencia",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6686"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4686"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",4.0],PARAMETER["central_meridian",-73.0],PARAMETER["scale_factor",0.9992],PARAMETER["false_easting",5000000],PARAMETER["false_northing",2000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","38820"]]',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:4326": {
        "proj": '+proj=longlat +datum=WGS84 +no_defs',
        "wkid": 4326,
        "labLat": "Latitud (N)",
        "labLng": "Longitud (W)",
        "labelLat": "4.668730",
        "labelLng": "-74.100403"
    },
    "EPSG:3857": {
        "proj": '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
        "wkid": 3857,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "517000",
        "labelLng": "-8230000"
    },
    "EPSG:4686": {
        "proj": '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs',
        "wkid": 4686,
        "labLat": "Norte (N)",
        "labLng": "Este (W)",
        "labelLat": "4.668730",
        "labelLng": "-74.100403"
    },
    "EPSG:21894": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-68.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=221.899,274.136,-397.554,-2.80844591036278,0.44850858891268,2.81017234679107,-2.199943 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:21896": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-77.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=307,304,-318,0,0,0,0 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:21897": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-74.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=307,304,-318,0,0,0,0 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:21898": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-71.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=307,304,-318,0,0,0,0 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:21899": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-68.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=221.899,274.136,-397.554,-2.80844591036278,0.44850858891268,2.81017234679107,-2.199943 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3114": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-80.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3114,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3115": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-77.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3115,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3116": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-74.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3116,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3117": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-71.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3117,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3118": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-68.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3118,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32617": {
        "proj": '+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs',
        "wkid": 32617,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32618": {
        "proj": '+proj=utm +zone=18 +datum=WGS84 +units=m +no_defs',
        "wkid": 32618,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32619": {
        "proj": '+proj=utm +zone=19 +datum=WGS84 +units=m +no_defs',
        "wkid": 32619,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32717": {
        "proj": '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs',
        "wkid": 32717,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32718": {
        "proj": '+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs',
        "wkid": 32718,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32719": {
        "proj": '+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs',
        "wkid": 32719,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6244": {
        "wkid": 102769, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6245": {
        "wkid": 102790, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6246": {
        "wkid": 102770, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6247": {
        "wkid": 102771, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6248": {
        "wkid": 102793, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6249": {
        "wkid": 102796, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6250": {
        "wkid": 102772, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6251": {
        "wkid": 102788, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6252": {
        "wkid": 102775, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6253": {
        "wkid": 102795, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6254": {
        "wkid": 102781, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6255": {
        "wkid": 102767, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6256": {
        "wkid": 102774, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6257": {
        "wkid": 102768, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6258": {
        "wkid": 102797, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6259": {
        "wkid": 102789, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6260": {
        "wkid": 102780, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6261": {
        "wkid": 102783, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6262": {
        "wkid": 102787, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6263": {
        "wkid": 102791, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6264": {
        "wkid": 102777, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6265": {
        "wkid": 102798, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6266": {
        "wkid": 102779, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6267": {
        "wkid": 102784, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6268": {
        "wkid": 102792, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6269": {
        "wkid": 102782, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6270": {
        "wkid": 102785, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6271": {
        "wkid": 102794, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6272": {
        "wkid": 102773, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6273": {
        "wkid": 102778, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6274": {
        "wkid": 102786, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6275": {
        "wkid": 102776, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    }
}

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return window.btoa(str);
    /*
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
     */
}

function b64DecodeUnicode(str) {
    return window.atob(str);
    /*
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    */
}