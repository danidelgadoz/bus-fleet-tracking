var map;

var polygonsDrawn = []; // Array de objetos, contiene todos los poligonos dibujados ...
var arrayGeocercas = []; // Array de objetos que almacena las geocercas traidas de la base de datos ...
var polygonIndex = null;

var unidadObj = []; // Array de objetos, contiene el marcador, el infowindow y su ID key
var markerT = []; // marker unidades consideradas en Transbordo
var directionsDisplay = []; // Array que guarda el markado de las rutas

var app = angular.module('MyApp', ['ngMaterial', 'ngMessages']);

app.config(function($mdThemingProvider) {
  
  var changeBlue = $mdThemingProvider.extendPalette('blue', {
    '900': '#004579',
    '800': 'rgb(11, 82, 135)'
  });
  $mdThemingProvider.definePalette('blueTCS', changeBlue);

  $mdThemingProvider.theme('altTheme')
      .primaryPalette('amber',{
        'default': '600', // by default use shade 400 from the pink palette for primary intentions
        'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
        'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
        'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
      })
      .accentPalette('teal')  
      .backgroundPalette('blueTCS',{
        'default': '400', // by default use shade 400 from the pink palette for primary intentions
        'hue-1': '900', // use shade 100 for the <code>md-hue-1</code> class
        'hue-2': '800', // use shade 600 for the <code>md-hue-2</code> class
        'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
      })
      .warnPalette('red')
      .dark();

  
  $mdThemingProvider.theme('default')
    .primaryPalette('blueTCS',{
      'default': '900', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
    })
    .accentPalette('amber')  
    .warnPalette('red')
    .backgroundPalette('grey');    
});


app.service('myScriptGmap', function(){
  var trafficLayer;
  var drawingManager;  
  var overlaysDrawn = []; // Array de objetos, contiene las figuras (no polygons) dibujados ...

  this.setDrawingTools = function(state){
    if(state){
        drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.A,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_CENTER,
                drawingModes: [
                    google.maps.drawing.OverlayType.MARKER,
                    google.maps.drawing.OverlayType.CIRCLE,
                    google.maps.drawing.OverlayType.POLYGON,
                    google.maps.drawing.OverlayType.POLYLINE,
                    google.maps.drawing.OverlayType.RECTANGLE
                ]
            },
            polygonOptions: {
                editable: true,
                strokeColor: '#165096',
                strokeOpacity: 1,
                strokeWeight: 2,
                fillColor: '#FBC707',
                fillOpacity: 0.7
            },
            markerOptions: {
                //icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png', 
                draggable: true
            }
        });
        drawingManager.setMap(map);   

        google.maps.event.addDomListener(drawingManager, 'polygoncomplete', function(polygon) {
            polygonIndex = polygon.zIndex;
            polygonsDrawn[polygonIndex] = polygon; // Empujo la figura creada en el array de objetos 'polygonsDrawn'
            $("#confirmGeocerca").modal(); // Pregunto si se desea inicar registro de geocerca

            google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
                polygonIndex = polygon.zIndex;
                polygonsDrawn[polygonIndex] = polygon;
                $("#confirmGeocerca").modal();
            });
            google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
                polygonIndex = polygon.zIndex;
                polygonsDrawn[polygonIndex] = polygon;
                $("#confirmGeocerca").modal();
            });                                 
        });    

        google.maps.event.addDomListener(drawingManager, 'markercomplete', function(marker) {
            marker.setDraggable(true);                   
            overlaysDrawn.push(marker);
        });
        google.maps.event.addDomListener(drawingManager, 'circlecomplete', function(circle) {
            circle.setEditable(true);
            circle.setDraggable(true);
            overlaysDrawn.push(circle);
        });
        google.maps.event.addDomListener(drawingManager, 'polylinecomplete', function(polyline) {
            polyline.setEditable(true);
            polyline.setDraggable(true);
            overlaysDrawn.push(polyline);
        });
        google.maps.event.addDomListener(drawingManager, 'rectanglecomplete', function(rectangle) {
            rectangle.setEditable(true);
            rectangle.setDraggable(true);
            overlaysDrawn.push(rectangle);
        }); 
    } else{
        drawingManager.setMap(null); 
        drawingManager = null;
    }
  };

  this.showFlotainMap = function(){
    var unidsGrilla= jQuery("#jqGridUnidades").jqGrid('getRowData');       

    if (unidadObj) {
        for (i in unidadObj) {
            unidadObj[i].marker.setMap(null);
        }
        unidadObj = [];
    }      
    
    for(var i=0; i<unidsGrilla.length; i++){
        var html =  '<table class="tableInfoW table table-hover table-condensed" style="font-size: 14px; margin-bottom: 0px">' +
                    '<tr><td><i style="padding-left:15px;">Ubicacion:</i></td><td><strong>' + unidsGrilla[i].trama + '</strong></td></tr>' +
                    '<tr><td><i style="padding-left:15px;">Ruta:</i></td><td><strong>' + unidsGrilla[i].ruta + '</strong></td></tr>' +
                    '<tr><td><i style="padding-left:15px;">Fecha:</i></td><td><strong>' + unidsGrilla[i].fecha + '</strong></td></tr>' +
                    '<tr><td><i style="padding-left:15px;">Velocidad:</i></td><td><strong>' + unidsGrilla[i].vel + '</strong></td></tr>' +
                    '<tr><td><i style="padding-left:15px;"><strong><b>Asientos:</b></strong></i></td><td align="center"><strong><b>' + unidsGrilla[i].nocupa + '<b></strong></td></tr>' +
                    '<tr><td><i style="padding-left:15px;"><font color="green"><strong><b>Ocupados:</b><strong></font></i></td><td align="center"><strong><font color="green"><b>' + unidsGrilla[i].tocupa + '</b></font></strong></td></tr>' +
                    '<tr><td><i style="padding-left:15px;"><font color="blue"><strong><b>Libres:</b></strong></font></i></td><td align="center"><strong><font color="blue"><b>' + unidsGrilla[i].tlibres + '</b></font></strong></td></tr></table>';

        var content =   '<div id="iw-container">' +
                            '<div class="iw-title" style="padding:10px;"><h3 style="text-align:center; margin:0px;">' + unidsGrilla[i].name + '</h3 style="text-align:center; margin:0px;"></div>' +
                            '<div class="iw-content">' +                   
                              html +                      
                            '</div>' +
                            '<div class="iw-bottom-gradient"></div>' +
                        '</div>';

        var LatLng = new google.maps.LatLng(unidsGrilla[i].lat, unidsGrilla[i].lng);               
        var unidRet = createMarker(unidsGrilla[i].id, LatLng, unidsGrilla[i].name, content, unidsGrilla[i].markerimage);
        
        unidadObj.push({
          id: unidRet[0].idKey,
          data: unidsGrilla[i],
          marker: unidRet[0].marker,
          infow: unidRet[0].infow
        });
    }
  };
  
  this.routeMarker = function(origen, destino, suppressMarkersx, waypts){
    var directionId = directionsDisplay.length;

    var directionsService = new google.maps.DirectionsService;
    directionsDisplay[directionId] = new google.maps.DirectionsRenderer({suppressMarkers: suppressMarkersx});// true - false


    directionsDisplay[directionId].setMap(map);

    directionsService.route({      
      origin: origen,
      destination: destino,
      waypoints: waypts,
      travelMode: google.maps.TravelMode.DRIVING
      }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay[directionId].setDirections(response);
          } else {
            myAlert.aviso('Directions request failed due to ' + status);
          }
    });
  };

  this.getDistanciaLineal = function(lat1, lon1, lat2, lon2){
      rad = function(x) {return x*Math.PI/180;};
      var R     = 6378.137;                     
      var dLat  = rad( lat2 - lat1 );
      var dLong = rad( lon2 - lon1 );

      var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c;
      return d.toFixed(3);//Retorna tres decimales
  };

  this.setTraffic = function(state){
    if (state) {
      trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    } else{
      trafficLayer.setMap(null);                 
      trafficLayer = null; 
    }    
  }

  this.cleanMap = function(){
    if (drawingManager) {
        this.setDrawingTools(false);
    }

    if (polygonsDrawn) {// Delete polygon by tool drawing ...
        for (i in polygonsDrawn) {
            polygonsDrawn[i].setMap(null);
        }
    }
        
    if (overlaysDrawn) {// Delete other objects by tool drawing ...
        for (i in overlaysDrawn) {
            overlaysDrawn[i].setMap(null);
        }
    }    
      
    if (arrayGeocercas) {// Eliminar vista en mapa y vaciar array de geocercas(en BD) ...
        for (i in arrayGeocercas) {
            arrayGeocercas[i].setMap(null);
        }
    }

    if (directionsDisplay) { // Elimina las rutas marcadas (consulta o transbordo) ....
        for (i in directionsDisplay) {
            directionsDisplay[i].setMap(null);
        }
    }

    if (markerT) {
        for (i in markerT) {
            markerT[i].setMap(null);
        }
    }

    polygonsDrawn = [];
    overlaysDrawn = [];   
    arrayGeocercas = [];
    directionsDisplay = [];
    markerT = [];
  };

  this.reverseGeocoding = function(latitud, longitud){
    var latlng = new google.maps.LatLng(latitud, longitud);  
    var infowindowGeocode = new google.maps.InfoWindow({maxWidth: 500});
    var geocoder = new google.maps.Geocoder();        
    
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                map.setZoom(11);

                var contenido = "<p>Coordenada ingresada: </p>"+
                                "<dl style='padding-left: 20px;'>"+
                                  "<dt>Latitud</dt>"+
                                  "<dd style='padding-left: 20px;'>" + latitud + "</dd>"+
                                  "<dt>Longitud</dt>"+
                                  "<dd style='padding-left: 20px;'>" + longitud +"</dd>"+
                                "</dl>"

                var html =   '<div id="iw-container">' +
                                  '<div class="iw-title" style="padding:10px;"><h4 style="text-align:center; margin:0px;">' + results[1].formatted_address + '</h4></div>' +
                                    '<div class="iw-content">' +                   
                                      contenido +                      
                                    '</div>' +
                                  '<div class="iw-bottom-gradient"></div>' +
                                '</div>';

                infowindowGeocode.setContent(html);
                infowindowGeocode.setPosition(latlng);
                infowindowGeocode.open(map);

                google.maps.event.addListener(infowindowGeocode, 'domready', function() {
                    var iwOuter = $('.gm-style-iw');
                    var iwBackground = iwOuter.prev();

                    iwBackground.children(':nth-child(2)').css({'display' : 'none'});
                    iwBackground.children(':nth-child(4)').css({'display' : 'none'});
                    iwBackground.children(':nth-child(3)').find('div').children().css({
                      'box-shadow': '0 1px 6px #165096', 
                      'z-index': '1', 
                      'background-color': 'rgba(255, 255, 255, 0.92)'//yellow: 'background-color': 'rgba(230, 183, 10, 0.65)'
                    });

                    var iwCloseBtn = iwOuter.next();
                    iwCloseBtn.css({
                      'box-sizing': 
                      'content-box', 
                      'opacity': '1', 
                      'right': '38px', 
                      'top': '3px', 
                      'border': '7px solid #004579', 
                      'border-radius': '13px', 
                      'box-shadow': '0 0 10px #165096'
                    });

                    if($('.iw-content').height() < 0){
                      $('.iw-bottom-gradient').css({display: 'none'});
                    }

                    iwCloseBtn.mouseout(function(){
                      $(this).css({opacity: '1'});
                    });
                });  

            } else {
                window.alert('No se han encontrado resultados');
            }
        } else {
              window.alert('Error: ' + status);
        }
    });    
  };

  function createMarker (id, latlng, name, html, icono) {
    var contentString = html;
    var unidadMarker = new google.maps.Marker({
        title: name,
        icon: icono,
        draggable: false,
        position: latlng,
        map: map
    });
    
    var unidadInfoW = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 500
    });

    google.maps.event.addListener(unidadMarker, 'click', function() {
        unidadInfoW.open(map, unidadMarker);
    });    

    google.maps.event.addListener(map, 'click', function() {
        unidadInfoW.close();
    });
    
    google.maps.event.addListener(unidadInfoW, 'domready', function() {
        var iwOuter = $('.gm-style-iw');
        var iwBackground = iwOuter.prev();

        iwBackground.children(':nth-child(2)').css({'display' : 'none'});
        iwBackground.children(':nth-child(4)').css({'display' : 'none'});
        iwBackground.children(':nth-child(3)').find('div').children().css({
          'box-shadow': '0 1px 6px #165096', 
          'z-index': '1', 
          'background-color': 'rgba(255, 255, 255, 0.92)'//yellow: 'background-color': 'rgba(230, 183, 10, 0.65)'
        });

        var iwCloseBtn = iwOuter.next();
        iwCloseBtn.css({
          'box-sizing': 
          'content-box', 
          'opacity': '1', 
          'right': '38px', 
          'top': '3px', 
          'border': '7px solid #004579', 
          'border-radius': '13px', 
          'box-shadow': '0 0 10px #165096'
        });

        if($('.iw-content').height() < 0){
          $('.iw-bottom-gradient').css({display: 'none'});
        }

        iwCloseBtn.mouseout(function(){
          $(this).css({opacity: '1'});
        });
    });    
        
    var obj = [];    
    obj.push({idKey: id, marker: unidadMarker, infow: unidadInfoW});
    return obj;
  };
});
app.service('myAlert', function($mdDialog){
  this.aviso = function(msj){
    $mdDialog.show(
      $mdDialog.alert()
        .title('Aviso')
        .textContent(msj)
        .ariaLabel('Navigation demo')
        .ok('OK!')
        .targetEvent(null)
    )
  };
});
app.service('sendToServerSide', function(myAlert){  
  this.saveGeocerca = function(obj){
    var jObject= JSON.stringify(obj);//jobject es el array de objetos en string con el formato JSON

    $.ajax({
        type:'post',
        cache:false,
        url:"../controlador/registrarGeocerca.php",
        data:{jObject:  jObject},
        success:function(server){//console.log(server);//cuando reciva la respuesta lo imprimo                
          //$("#modalRegistroExitoso").modal();
          myAlert.aviso("Se ha registrado la geocerca en base de datos. Verifique el listado nuevamente.");
        }
    });
  };    
});


app.controller('mainAppCtrl', function ($scope, $timeout, $interval, $mdSidenav, $log, myScriptGmap) {
  $scope.toggleLeft = buildDelayedToggler('left');
  var mapOptions = {
    center: {lat: -12.07889, lng: -76.98833},
    zoom: 12,
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: true
  }

  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  myScriptGmap.setTraffic(true);

  $timeout (function (){ // AL CARGAR O ACTUALIZAR LA PAGINA
    myScriptGmap.showFlotainMap();
  }, 1000);

  $interval (function () {      
      jQuery("#jqGridUnidades").setGridParam({
        datatype:'xml', 
        page:1
      }).trigger('reloadGrid'); // Actualiza la grilla de unidades ...      
      
      $timeout (function (){
          myScriptGmap.showFlotainMap();          
          
          if(id_rowselected != 0)
            selectedRow();

      }, 500); // Actualiza los macadores de las unidades en el mapa

  },10*60*1000); // <-- N // each N seconds the grid is refreshed, and 0.5 seg lather the markers in the map       

  function selectedRow(){
      document.getElementById(id_rowselected).style.border = '1px solid #FAD42E';
      document.getElementById(id_rowselected).style.background = '#FBEC88';
      document.getElementById(id_rowselected).style.color = '#363636';
      document.getElementById(id_rowselected).scrollIntoView(true);
  };  

  $scope.isOpenSideNav = function(){
    return $mdSidenav('left').isOpen();
  };

  $scope.closeSideNav = function () {
    $mdSidenav('left').close()
      .then(function () {
        //$log.debug("close LEFT is done");
      });
  }; 

  function debounce(func, wait, context) {   
    var timer;
    return function debounced() {
      var context = $scope,
          args = Array.prototype.slice.call(arguments);
      $timeout.cancel(timer);
      timer = $timeout(function() {
        timer = undefined;
        func.apply(context, args);
      }, wait || 10);
    };
  };
  function buildDelayedToggler(navID) {      
    return debounce(function() {
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          //$log.debug("toggle " + navID + " is done");
        });
    }, 300);
  };
});
app.controller('menuListCtrl', function($scope, $mdDialog, $timeout, myAlert, myScriptGmap, $mdSidenav) {
  $scope.trafico = true;
  $scope.drawingTools = false;
  var unidad_Gservice = []; // array de objetos cargados mediante googleservice -- usado solo en transbordo  

  $scope.modalTransbordoMD = function(ev) {  
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'dialog1.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: true
    })
    .then(function(answer) {
      //alert('You said the information was "' + answer + '".');
    }, function() {
      //alert('You cancelled the dialog.');
    });
  };
    // CONTROLADOR DEL DIALOGO DE FORMULARIO TRANSBORDO ...
    function DialogController($scope) {
        $scope.unidad = null;//"7104C";    
        $scope.buttonDisable = true;
        $scope.errorTransbordo = {state: false, msj: null};

        $scope.transbordoType = [
            { id: 1, description: 'Toda la flota' },
            { id: 2, description: 'Mismo destino' }
        ];

        $scope.tipo = $scope.transbordoType[0];

        $scope.buttonState = function(){   
          if($scope.unidad){
            if ($scope.unidad.length > 5) {
              $scope.buttonDisable = true;

            } else if ($scope.unidad.length < 5){
              $scope.buttonDisable = true;

            } else{
              $scope.buttonDisable = false;

            }   
          } 
          if(!$scope.tipo){
            $scope.buttonDisable = true;
          }
        };

        $scope.hide = function() {
          $mdDialog.hide();
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

        $scope.startTransbordox = function(unidad, tipo) {  
            // Se retira del los objetos del ultimo transbordo ...
            if (directionsDisplay)
                for (j in directionsDisplay) {directionsDisplay[j].setMap(null);}
            if (markerT) 
                for (z in markerT) {markerT[z].setMap(null);}
            
            // Se vacea el Array objetos del ultimo transbordo ...
            directionsDisplay = [];
            markerT = []; 

            for (var i = 0; i < unidadObj.length; i++){
                if(unidad == unidadObj[i].data.name){                                  
                    // Iniciamos el nuevo transbordo ...                    
                    Transbordo(unidadObj[i].data, tipo);

                    dialogTransbordo.dialog('option', 'title', 'Transbordo ' + unidadObj[i].data.name + " - " + unidadObj[i].data.ruta);
                    $mdDialog.hide(unidad); // Si se ingreso contenido en el input, se cierra el dialogo formTransbordo 
                    $mdSidenav('left').close(); // Se cierra el sideNav

                    break;
                }

                if(i == (unidadObj.length - 1)){
                    $scope.errorTransbordo = {
                      state: true, 
                      msj: "La unidad '" + unidad + "' no existe, ingrese una unidad valida."
                    };                             
                }
            }      
        };
    };

      // FUNCIONES DEL CONTROLADOR DEL DIALOGO DE FORMULARIO TRANSBORDO ...
      function Transbordo(obj, filtro){  
        map.setZoom(12);   
        var unidadForTransbordo = [];
        var origen = {lat: parseFloat(obj.lat), lng: parseFloat(obj.lng)}; 

        if(filtro.id == 1){ // 'Toda la flota' ...
            for (i in unidadObj) {
                var distanciaLineal = myScriptGmap.getDistanciaLineal(obj.lat, obj.lng, unidadObj[i].data.lat, unidadObj[i].data.lng);        
                unidadForTransbordo.push({
                    unidad: unidadObj[i].data.name, 
                    distancia: distanciaLineal, 
                    lat: unidadObj[i].data.lat, 
                    lng: unidadObj[i].data.lng,
                    ruta: unidadObj[i].data.ruta,
                    asientos: unidadObj[i].data.nocupa,
                    aocupados: unidadObj[i].data.tocupa,
                    alibres: unidadObj[i].data.tlibres
                });        
            }

        } else if(filtro.id == 2){ // 'Mismo destino' ...
            for (i in unidadObj) {
                if( obj.ruta.slice(3) ==  unidadObj[i].data.ruta.slice(3)){
                    var distanciaLineal = myScriptGmap.getDistanciaLineal(obj.lat, obj.lng, unidadObj[i].data.lat, unidadObj[i].data.lng);        
                    unidadForTransbordo.push({
                        unidad: unidadObj[i].data.name, 
                        distancia: distanciaLineal, 
                        lat: unidadObj[i].data.lat, 
                        lng: unidadObj[i].data.lng,
                        ruta: unidadObj[i].data.ruta,
                        asientos: unidadObj[i].data.nocupa,
                        aocupados: unidadObj[i].data.tocupa,
                        alibres: unidadObj[i].data.tlibres
                    });
                }
            }  

        } else{
          $scope.errorTransbordo = {state: true, msj: "filtro no valido"};
        }            

        unidadForTransbordo.sort(function(a, b){return a.distancia - b.distancia});
      
        for (var i = 0; i < unidadForTransbordo.length; i++){
            if(obj.name != unidadForTransbordo[i].unidad)                    
                calcularDistanciaGoogle(origen, unidadForTransbordo[i], i);     
            if( i === 19)
                break;
        }
        
        var icono = 'http://maps.google.com/mapfiles/kml/paddle/grn-stars.png';
        createMarkerTransbordo(new google.maps.LatLng(obj.lat, obj.lng), obj.name, icono, 0);
        map.setCenter(new google.maps.LatLng(obj.lat, obj.lng));

        $timeout(function lookCloseDistance(){ 
            unidad_Gservice.sort(function(a, b){return a.distancia - b.distancia});
            var transbordoLista = []; // Listado de unidades para transbordar (10obj);
            
            for(var i = 0; i < unidad_Gservice.length; i++){             
                myScriptGmap.routeMarker(origen, unidad_Gservice[i].punto, true, null);       

                transbordoLista.push({
                  "id": (i+1),
                  "unidad": unidad_Gservice[i].unidadTransb.unidad,
                  "distancia": unidad_Gservice[i].distanciacuni,
                  "tiempo": unidad_Gservice[i].tiempo,
                  "ruta": unidad_Gservice[i].unidadTransb.ruta,
                  "asientos": unidad_Gservice[i].unidadTransb.asientos,
                  "ocupados": unidad_Gservice[i].unidadTransb.aocupados,
                  "libres": unidad_Gservice[i].unidadTransb.alibres
                });

                if( i === 9) //"UNIDADES MAS CERCANAS POR RUTA (TOP 10)";                         
                    break;
            }

            $timeout(function drawMarkerEfect(){                
                for(var i = 0; i < unidad_Gservice.length; i++){               
                    var coordenada = unidad_Gservice[i].punto;
                    var icono = 'http://maps.google.com/mapfiles/kml/paddle/' + (i+1) + '.png';
                    createMarkerTransbordo(coordenada, unidad_Gservice[i].unidadTransb.unidad, icono, (i+1));
                    if( i === 9)
                      break;
                }
                
                $scope.transbordoData = transbordoLista;  
                dialogTransbordo.dialog( "open" );    // $("#modalTransbordoList").modal();    

                unidad_Gservice = []; // borro objetos (19) que contiene el resultado del servicio distanceMatrixService de google

            }, 1500);      
        }, 3000);
      };          
      function calcularDistanciaGoogle(origen, obj, i) {
        var origin1 = origen;
        var destinationA = {lat: parseFloat(obj.lat), lng: parseFloat(obj.lng)};

        var geocoder = new google.maps.Geocoder;

        var service = new google.maps.DistanceMatrixService;
        service.getDistanceMatrix({
            origins: [origin1],
            destinations: [destinationA],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, function(response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                myAlert.aviso('Error was: ' + status);
            } else {
                var results = response.rows[0].elements;                                                                 
                var distanciaGservice = results[0].distance.text;
                var distancia_procesar = 0;
                
                if (distanciaGservice.slice(-2) == 'km'){
                    var distanciaString = distanciaGservice.substring(0, distanciaGservice.length-3);
                    var distancia_sin_decimal = distanciaString.replace(".", "");
                    distancia_sin_decimal = distancia_sin_decimal.replace(",", "."); 
                    distancia_procesar = parseFloat(distancia_sin_decimal);     

                } else{
                    var distanciaString = distanciaGservice.substring(0, distanciaGservice.length-2);
                    distancia_procesar = parseFloat(distanciaString);
                    distancia_procesar = distancia_procesar / 1000;// valor de distancia a kilometros              

                }
                
                unidad_Gservice.push({
                    distancia: distancia_procesar,
                    distanciacuni: distanciaGservice,
                    tiempo: results[0].duration.text,
                    punto: destinationA,
                    unidadTransb: obj
                });
            }
        });                
      };
      function createMarkerTransbordo(latlng, name, icono, i) { 
        var timeout = i * 500;
        $timeout(function() {  
            markerT[i] = new google.maps.Marker({
                title: name,
                icon: icono,
                position: latlng,
                animation: google.maps.Animation.DROP,
                map: map,
                draggable: false
            });
        }, timeout);
      };

      // SCOPE DEL DIALOGO JQUERY DE REULTADO DEL TRANSBORDO ...
      $scope.markerEffect = function(unidad){
        for(var i = 0; i < markerT.length; i++){
            if( unidad === markerT[i].title){
                if (markerT[i].getAnimation() !== null) 
                    markerT[i].setAnimation(null);
                else 
                    markerT[i].setAnimation(google.maps.Animation.BOUNCE);
            }
        }    
      };

  $scope.openIngresarGeocerca = function(){
    $("#modalTazarRuta").modal();
  };

  $scope.openModalRegistrarGeocerca = function() {
    // show modal bootstrap, tiene un controlador independiente
    $("#modalRegistrarGeocerca").modal();
  };

  $scope.openModalAproximaciones = function() {
    // show modal
    $("#modalAproximaciones").modal();
  };

  $scope.openModalGeocercas = function() {
    jQuery("#jqGridGeocercas").setGridParam({
        datatype:'json',
        page:1
      }).trigger('reloadGrid'); // Actualiza la grilla de unidades ... 

    // show modal
    $("#modalGeocercas").modal();
    
    $timeout (function (){
      $("#jqGridGeocercas").setGridWidth($("#divGeocercasList").width());
    }, 250);    
  };    

  $scope.onChangeTrafic = function(cbState) {
    if(cbState){      
      myScriptGmap.setTraffic(true); 
    }else{             
      myScriptGmap.setTraffic(false);
    } 
  };

  $scope.onChangeDrawing = function(cbStatex) {
    if (cbStatex) {            
      myScriptGmap.setDrawingTools(true);
    }else{    
      myScriptGmap.setDrawingTools(false);        
    };
  };  

  $scope.onChangeMapType = function(mapa) {
    switch(mapa.id) {
        case 1:
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
            break;
        case 2:
            map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
            break;
        case 3:
            map.setMapTypeId(google.maps.MapTypeId.HYBRID);
            break;
        case 4:
            map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
            break;
        default:
            map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    }
  };

  $scope.loadMapTypes = function() {
    return $timeout(function() {

      $scope.mapType =  $scope.mapType  || [
        { id: 1, description: 'ROADMAP' },
        { id: 2, description: 'SATELLITE' },
        { id: 3, description: 'HYBRID' },
        { id: 4, description: 'TERRAIN' }
      ];

    }, 650);
  };

  $scope.cleanMap = function (){ 
    // resetea el mapa a default       
    myScriptGmap.cleanMap();
    $scope.drawingTools = false;
  }

  $scope.openModalEmularRuta = function() {
    // show modal
    $("#modalEmularRuta").modal();
  };

  $scope.openModalUbicarLatLng = function() {
    // show modal
    $("#modalUbicarLatLng").modal();
  };

  $scope.showAlert = function(to, event) {
    //alerta de botron no configurado
    myAlert.aviso(to);
  };
});


//-------- CONTROLADORES DE LOS MODAL BOOTSTRAP ------------
app.controller('registroGeocercaFormCtrl', function($scope, myScriptGmap, myAlert, sendToServerSide) {
  $scope.geocerca = {
    idRuta: 'XXXXXX',
    idPlantilla: 'XXXX',
    descripcion: '',
    maxVelocidad: '0'
  };

  $scope.coordenadas = [{}];
  $scope.coordenadas[0] = {latitud: null, longitud: null}

  // $scope.coordenadas[0] = {latitud: -12.03965632859293, longitud: -77.01107025146484};
  // $scope.coordenadas[1] = {latitud: -12.09370998738134, longitud: -77.05192565917969};
  // $scope.coordenadas[2] = {latitud: -12.10445227176988, longitud: -76.94892883300781};

  $scope.AddVertice = function(){
    $scope.coordenadas.push({latitud: null, longitud: null});
  };

  $scope.CleanCoords = function(){
    $scope.coordenadas = [{}];
    $scope.coordenadas[0] = {latitud: null, longitud: null}
  };

  $scope.Registrar = function(){
    if(!$scope.geocerca){
      console.log("Ingresar datos de la geocerca ... !!!")
      return;
    }
    $scope.coordenadas[0].idRuta = $scope.geocerca.idRuta;
    $scope.coordenadas[0].idPlantilla = $scope.geocerca.idPlantilla;
    $scope.coordenadas[0].descripcion = $scope.geocerca.descripcion;
    $scope.coordenadas[0].maxVelocidad = $scope.geocerca.maxVelocidad
    
    sendToServerSide.saveGeocerca($scope.coordenadas);
  };
});

app.controller('trazarRutaCtrl', function($scope, myScriptGmap, myAlert) {
  $scope.unidad = null;//"7104C";
  $scope.buttonDisabled = true;
  $scope.errorRuta = {state: false, msj: null}; 

  $scope.buttonChangeState = function(){   
    if($scope.unidad){
      if ($scope.unidad.length > 5) {
        $scope.buttonDisabled = true;

      } else if ($scope.unidad.length < 5){
        $scope.buttonDisabled = true;

      } else{
        $scope.buttonDisabled = false;

      }   
    }else{
      $scope.buttonDisabled = true;
    } 
  };

  $scope.showRutaTrazada = function(){  
    for (var i = 0; i < unidadObj.length; i++){
        if($scope.unidad == unidadObj[i].data.name){
            var unidadToAprox = {
                origen: unidadObj[i].data.ruta.slice(0,3),
                destino: unidadObj[i].data.ruta.slice(3,6),
                myLatLng: new google.maps.LatLng( parseFloat(unidadObj[i].data.lat), parseFloat(unidadObj[i].data.lng) )
            } 

            if ( unidadToAprox.origen != "___" ){
                trazarRutaNow(0, unidadToAprox.origen, unidadToAprox.destino);   

            }else{
                $scope.errorRuta = {
                  state: true, 
                  msj: "La aplicacion no soporta unidades con ruta indefinida."
                };                
            }

            break;
        }

        if(i == (unidadObj.length - 1)){
          $scope.errorRuta = {
            state: true, 
            msj: "La unidad '" + $scope.unidad + "' no existe, ingrese una unidad valida."
          };  
        }
        
    }
  };

  $scope.cleanFieldsTR = function(){
    $scope.errorRuta = {state: false, msj: null}; 
  };
  
  function trazarRutaNow(i, origen_ini3, destino_ini3){                                              
    if( destino_ini3 == "BOG" || destino_ini3 == "GYE" || origen_ini3 == "BOG" || origen_ini3 == "GYE" ){                    
        var waypts = [];
        
        if( destino_ini3 == "BOG" || destino_ini3 == "GYE"){
            waypts.push({location: {lat: -3.567472, lng: -80.459173},stopover: true});//PIURA                        
            if( destino_ini3 == "BOG"){
                waypts.push({location: {lat: -2.141721, lng: -79.879239},stopover: true});//GUAYAQUIL
                waypts.push({location: {lat: -0.18101662086297404, lng: -78.46744537353515},stopover: true});//QUITO
                waypts.push({location: {lat: 3.451641359578082, lng: -76.53198145329952},stopover: true});//CALI
            }                        
        } else{ //origen bogota o guayaquil
            if( origen_ini3 == "BOG" ){
                waypts.push({location: {lat: 3.451641359578082, lng: -76.53198145329952},stopover: true});//CALI
                waypts.push({location: {lat: -0.18101662086297404, lng: -78.46744537353515},stopover: true});//QUITO
                waypts.push({location: {lat: -2.141721, lng: -79.879239},stopover: true});//GUAYAQUIL
            }
            waypts.push({location: {lat: -3.567472, lng: -80.459173},stopover: true});//PIURA
        }                    
    }
    
    if( destino_ini3 == "BSA" || destino_ini3 == "SCL" || origen_ini3 == "BSA" || origen_ini3 == "SCL" ){                                       
        var waypts = [];
        
        if( destino_ini3 == "BSA" || destino_ini3 == "SCL"){
            waypts.push({location: {lat: -18.47818446312165, lng: -70.3126072883606},stopover: true});//ARICA-CHILE                        
            if( destino_ini3 == "BSA"){
                waypts.push({location: {lat: -24.238199240844686, lng: -65.26840209960937},stopover: true});//PASO DE JAMA-ARGENTINA
                waypts.push({location: {lat: -31.42016878638377, lng: -64.18880023062229},stopover: true});//CORDOBA-ARGENTINA                            
            } else{//destino santiago de chile
                waypts.push({location: {lat:  -29.033583687428187, lng: -71.43319129943847},stopover: true});//CHAÑARAL-CHILE                            
            }                        
        } else{ //origen buenos aires o santiago de chile
            if( origen_ini3 == "BSA" ){
                waypts.push({location: {lat: -31.42016878638377, lng: -64.18880023062229},stopover: true});//CORDOBA-ARGENTINA 
                waypts.push({location: {lat: -23.234281, lng: -67.026541},stopover: true});//PASO DE JAMA-ARGENTINA
            } else{//destino santiago de chile
                waypts.push({location: {lat:  -29.033583687428187, lng: -71.43319129943847},stopover: true});//CHAÑARAL-CHILE                            
            }  
            waypts.push({location: {lat: -18.47818446312165, lng: -70.3126072883606},stopover: true});//ARICA-CHILE 
        }                    
    }  

    var origenfound, destinofound;
    var origen, destino
    var destinosObj = $("#jqGridDestinos").getRowData(); 

    for (var i = 0; i < destinosObj.length; i++){
        if(origen_ini3 == destinosObj[i].id){
            origen = { lat: parseFloat(destinosObj[i].lat), lng: parseFloat(destinosObj[i].lng )};                       
            origenfound = true;
        }
        
        if(destino_ini3 == destinosObj[i].id){
            destino = { lat: parseFloat(destinosObj[i].lat), lng: parseFloat(destinosObj[i].lng )};
            destinofound = true;
        }                    
    }                                     
    
    if( origenfound == true && destinofound == true ){        
        myScriptGmap.routeMarker(origen, destino, false, waypts);
        $("#modalTazarRuta").modal("hide");
    }else{
        $scope.errorRuta = {
          state: true, 
          msj: "El origen " + origen_ini3 + " o el destino " + destino_ini3 + " no esta registrado en la aplicacion, comuniquelo a Sistemas."
        };    
    }
  }             
});

app.controller('aproximacionesCtrl', function($scope, $timeout, myAlert) {
  $scope.unidad = null;
  $scope.ruta = null;   
  $scope.ubicacionAct = null;   
  $scope.origen = {};
  $scope.destino = {};  
  $scope.recorrido = {};
  $scope.restante = {};
  $scope.total = {};

  $scope.loading = false;
  $scope.showAproxRspta = false;
  $scope.errorAprx = {state: false, msj: null}; 
  $scope.buttonDisabled = true;

  $scope.buttonChangeState = function(){  
    if($scope.unidad){
      if ($scope.unidad.length > 5) {
        $scope.buttonDisabled = true;

      } else if ($scope.unidad.length < 5){
        $scope.buttonDisabled = true;

      } else{
        $scope.buttonDisabled = false;

      }   
    }else{
      $scope.buttonDisabled = true;
    } 
  };

  $scope.showAproximaciones = function(){  
    $scope.showAproxRspta = false;
    $scope.errorAprx = {state: false, msj: null}; 

    for (var i = 0; i < unidadObj.length; i++){
        if($scope.unidad == unidadObj[i].data.name){
            if(unidadObj[i].data.ruta != "______"){
              $scope.ruta = unidadObj[i].data.name;
              $scope.recorrido = [];
              $scope.restante = [];
              $scope.total = []
              getAproximaciones(unidadObj[i].data);

            } else{
              $scope.errorAprx = {state: true, msj: "La aplicacion no soporta unidades con ruta indefinida"};         
            }                        

            break;
        }

        if(i == (unidadObj.length - 1)){
            $scope.errorAprx = {
              state: true, 
              msj: "La unidad '" + $scope.unidad + "' no existe, ingrese una unidad valida."
            };  
        }
    }
  };

  $scope.cleanFields = function(){
	    // $scope.unidad = null;
	    $scope.ruta = null;
	    // $scope.buttonDisabled = true;
	    $scope.origen = {};
	    $scope.destino = {};

	    $scope.recorrido = [];
	    $scope.restante = [];
	    $scope.total = [];

	    $scope.showAproxRspta = false;
	    $scope.errorAprx = false;
  };

  function getAproximaciones(obj){    
    $scope.loading = true;

    var unidadToAprox = {
        origen: obj.ruta.slice(0,3),
        destino: obj.ruta.slice(3,6),
        myLatLng: new google.maps.LatLng( parseFloat(obj.lat), parseFloat(obj.lng) )
    }     

    var destinosObj = $("#jqGridDestinos").getRowData();        
    var origenData, destinoData;  

    for (var i = 0; i < destinosObj.length; i++){
        if(unidadToAprox.origen == destinosObj[i].id){
            origenData = {lat: parseFloat(destinosObj[i].lat), lng: parseFloat(destinosObj[i].lng)};
            $scope.origen = { ciudad: destinosObj[i].ciudad, descripcion: '(' + destinosObj[i].descripcion + ')' };
        }
        if(unidadToAprox.destino == destinosObj[i].id){
            destinoData = {lat: parseFloat(destinosObj[i].lat), lng: parseFloat(destinosObj[i].lng)};                
            $scope.destino = { ciudad: destinosObj[i].ciudad, descripcion: '(' + destinosObj[i].descripcion + ')' };
        }
    } 

    if( !(origenData && destinoData) ){
      $scope.errorAprx = {
        state: true, 
        msj: "El origen " + unidadToAprox.origen + " o el destino " + unidadToAprox.destino + " no esta registrado en la aplicacion, comuniquelo a Sistemas."
      };  
      $scope.loading = false;
      return;
    }
    
    distMatrixGservice = [];
    pushArrayDMG(origenData, unidadToAprox.myLatLng, "Recorrido");
    pushArrayDMG(unidadToAprox.myLatLng, destinoData, "Restante");
    pushArrayDMG(origenData, destinoData, "Total");
    getLocation(unidadToAprox.myLatLng);

    $timeout(function (){  
      var distTotal	 = $scope.restante.distanciaValue + $scope.recorrido.distanciaValue;
      var totalTime = $scope.restante.tiempoValue + $scope.recorrido.tiempoValue;
      var hours = Math.floor(totalTime / 3600);
      var minutes = Math.ceil((totalTime % 3600) / 60);
      //var seconds = (totalTime % 3600) % 60;
		
      $scope.total = { 
        distancia: Math.round( distTotal / 1000 ) + " km", 
        tiempo: hours + "h " +  minutes + " min"
      };

      $scope.showAproxRspta = true;
      $scope.loading = false;

    }, 3500);
  };

  function pushArrayDMG(origen, destino, desc){      
      var origin1 = origen;
      var destinationA = destino;

      var service = new google.maps.DistanceMatrixService;
      service.getDistanceMatrix({
          origins: [origin1],
          destinations: [destinationA],
          travelMode: google.maps.TravelMode.DRIVING,
          drivingOptions: {departureTime: new Date(Date.now())},
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
      }, function(response, status) {
          if (status !== google.maps.DistanceMatrixStatus.OK) {
              myAlert.aviso('Error was: ' + status);
          } else {
              var results = response.rows[0].elements;                                                             
              var distanciaGservice = results[0].distance.text;
              var tiempoGservice = results[0].duration.text;
              
              switch(desc) {
                  case "Restante":
                      $scope.restante = { 
                        distancia: distanciaGservice.replace(".", ""), 
                        tiempo: tiempoGservice,
                        distanciaValue: results[0].distance.value,
                        tiempoValue: results[0].duration.value
                      };
                      break;
                  case "Recorrido":
                      $scope.recorrido = { 
                        distancia: distanciaGservice.replace(".", ""), 
                        tiempo: tiempoGservice,
                        distanciaValue: results[0].distance.value,
                        tiempoValue: results[0].duration.value
                      };
                      break;
              }
          }
      });
  };

  function getLocation(latlng){
      var geocoder = new google.maps.Geocoder();        
      
      geocoder.geocode({'location': latlng}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
              if (results[1]) {                
                  $scope.ubicacionAct = results[1].formatted_address;

              } else {
                  $scope.ubicacionAct = 'No se puede ubicar coordenadas';
              }
          } else {
                $scope.ubicacionAct = 'Error: ' + status;
          }
      });    
  };
});

app.controller('geocercaDataCtrl', function($scope, sendToServerSide) {
  $scope.geocerca = {
    idRuta: 'LIMQTO',
    idPlantilla: '0001',
    descripcion: 'Lima - Quito',
    maxVelocidad: '90'
  }

  $scope.registarGeocerca = function(){
    var polygon = polygonsDrawn[polygonIndex];
    var polygonBounds = polygon.getPath();    
    var polygonCoords = [];

    for (var i = 0; i < polygonBounds.length; i++) {        
        polygonCoords.push({
          latitud: polygonBounds.getAt(i).lat(),
          longitud: polygonBounds.getAt(i).lng()
        });
    } 

    polygonCoords[0].idRuta = $scope.geocerca.idRuta;
    polygonCoords[0].idPlantilla = $scope.geocerca.idPlantilla;
    polygonCoords[0].descripcion = $scope.geocerca.descripcion;
    polygonCoords[0].maxVelocidad = $scope.geocerca.maxVelocidad;
    
    //sendObjToServerSide(polygonCoords);
    console.log(polygonCoords);
    // sendToServerSide.saveGeocerca(polygonCoords);

    $scope.geocerca.idRuta = 'LIMQTO';
    $scope.geocerca.idPlantilla = '0001';
    $scope.geocerca.descripcion = 'Lima - Quito'
    $scope.geocerca.maxVelocidad = '90';
  };

  $scope.cleanFields = function(){
    $scope.geocerca.idRuta = 'LIMQTO';
    $scope.geocerca.idPlantilla = '0001';
    $scope.geocerca.descripcion = 'Lima - Quito'
    $scope.geocerca.maxVelocidad = '90';
  };
});

app.controller('emularRutaCtrl', function($scope, myScriptGmap) {
  $scope.buttonDisabled = false;
  $scope.coordenadas = {
    origenLat: -12.091360055131373,//0.36083,
    origenLng: -77.02274322509766,
    destinoLat: -11.600449486739072,
    destinoLng: -76.12220764160156
  };

  $scope.buttonChangeState = function(){  
    if($scope.coordenadas.origenLat && $scope.coordenadas.origenLng && $scope.coordenadas.destinoLat && $scope.coordenadas.destinoLng){
      $scope.buttonDisabled = false;   
    }else{
      $scope.buttonDisabled = true;
    } 
  };

  $scope.emularRutaNow = function(){ 
    var origen = {lat: parseFloat($scope.coordenadas.origenLat) , lng: parseFloat($scope.coordenadas.origenLng)};
    var destino = {lat: parseFloat($scope.coordenadas.destinoLat), lng: parseFloat($scope.coordenadas.destinoLng)};

    myScriptGmap.routeMarker(origen, destino, true, null);
    
    $scope.coordenadas = [];
  };
});

app.controller('UbicarLatLngCtrl', function($scope, myScriptGmap) {
  $scope.buttonDisabled = false;
  $scope.coordenada = {
    lat: -12.091360055131373,//0.36083,
    lng: -77.02274322509766
  };

  $scope.buttonChangeState = function(){  
    if($scope.coordenada.lat && $scope.coordenada.lng){
      $scope.buttonDisabled = false;   
    }else{
      $scope.buttonDisabled = true;
    } 
  };

  $scope.ubicarLatLngNow = function(){ 
    myScriptGmap.reverseGeocoding(parseFloat($scope.coordenada.lat), parseFloat($scope.coordenada.lng));    
    $scope.coordenada = [];
  };
});

function addInputDiv() {
    console.log("jajaja");
    $("#aqui").append('<div class="ddd" id="div' + row_counter + '">' +
            '<label for="lat' + row_counter + '" style="width:31; padding-right: .3em;">Latitud [' + row_counter + ']:</label>' +
            '<input type="text" name="lat' + row_counter + '" id="lat' + row_counter + '" value="-12.04066363923191" class="text ui-widget-content ui-corner-all" style="width:110px;">' +
            '<label for="lon' + row_counter + '" style="width:31%; padding-right: .3em; padding-left: .3em;">Longitud [' + row_counter + ']:</label>' +
            '<input type="text" name="lon' + row_counter + '" id="lon' + row_counter + '" value="-76.96746826171875" class="text ui-widget-content ui-corner-all" style="width:110px;">' +
            '</div>');               
    row_counter = row_counter + 1;
  };