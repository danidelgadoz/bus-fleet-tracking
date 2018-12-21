var id_rowselected = 0;  

$(document).ready(function () {
    //**************************** LISTADO DE UNIDADES ***********************************/
    var listadoUnidades = $("#jqGridUnidades").jqGrid({
        url: 'kml/grilla.xml',
        datatype: "xml",
        loadonce : true,
        colModel: [  
            {label:'N°', name: 'id', width: 25, sorttype:'integer'},          
            {label:'Fecha', name: 'fecha', width: 150, align: "center"},
            {label:'Ruta', name: 'ruta', width: 75, align: "center"},
            {label:'Unidad', name: 'name', width: 75, align: "center"},
            {label:'Asientos', name: 'nocupa', width: 75, align: "center"},
            {label:'Ocupados', name: 'tocupa', width: 75, align: "center"},
            {label:'Libres', name: 'tlibres', width: 75, align: "center"},
            {label:'Ubicacion', name: 'trama', width: 150},
            {label:'Vel', name: 'vel', width: 75, align: "center"},
            {label:'Latitud', name: 'lat', width: 75, align: "right"},
            {label:'Longitud', name: 'lng', width: 75, align: "right"},
            {label:'Icono', name: 'markerimage', width: 75, hidden:"true"}            
        ],        
        viewrecords: true, // muestra cantidad de objetos ...
        height: ($(window).height() * (0.3) - 77),
        width: $(window).width() - 5,
        rowNum: 200, //filas visibles en pg1
        //rownumbers: true, 
        caption: 'Listado de unidades',
        scroll: 1, // set the scroll property to 1 to enable paging with scrollbar - virtual loading of records
        emptyrecords: 'Scroll to bottom to retrieve new page', // the message will be displayed at the bottom 
        pager: "#jqGridPagerUnidades"
    });//XML
    
    listadoUnidades.navGrid('#jqGridPagerUnidades', { 
        edit: false, 
        add: false, 
        del: false,
        search: true,
        refresh: true,
        view: true,
        position: "left",
        cloneToTop: false 
    });

    jQuery("#jqGridUnidades").click(function() {
        var grid = $("#jqGridUnidades");
        var rowKey = parseInt(grid.getGridParam("selrow"));

        if( !unidadObj[rowKey-1] ){
            console.log("Espere que terminen de cargar las unidades en el mapa...");
        }
        else{
            map.setCenter({
                lat: parseFloat(unidadObj[rowKey-1].data.lat), 
                lng: parseFloat(unidadObj[rowKey-1].data.lng) 
            });
            unidadObj[rowKey-1].infow.open(map, unidadObj[rowKey-1].marker)  
        }


        if (id_rowselected != 0){
            document.getElementById(id_rowselected).style.border = '';
            document.getElementById(id_rowselected).style.background = '';
            document.getElementById(id_rowselected).style.color = '';

            $('#'+rowKey).removeClass("success");
            document.getElementById(rowKey).style.border = '1px solid #FAD42E';
            document.getElementById(rowKey).style.background = '#FBEC88';
            document.getElementById(rowKey).style.color = '#363636'; 
        } else{
            $('#'+rowKey).removeClass("success");
            document.getElementById(rowKey).style.border = '1px solid #FAD42E';
            document.getElementById(rowKey).style.background = '#FBEC88';
            document.getElementById(rowKey).style.color = '#363636'; 
        }
        id_rowselected = rowKey;     
    });

    jQuery("#jqGridUnidades").jqGrid('setLabel', 'id', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'fecha', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'ruta', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'name', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'nocupa', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'tocupa', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'tlibres', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'trama', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'vel', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'lat', '', {'text-align':'center'});
    jQuery("#jqGridUnidades").jqGrid('setLabel', 'lng', '', {'text-align':'center'});


    //**************************** LISTADO DE DESTINOS ***********************************/
    var listadoDestisnos = $("#jqGridDestinos").jqGrid({
            url: 'kml/agencias.xml',
            datatype: "xml",
            colModel: [
                { ID: 'Inv No', name: 'id' },
                { CIUDAD: 'Date', name: 'ciudad' },
                { LATITUD: 'Client', name: 'lat' },
                { LONGITUD: 'Notes', name: 'lng' },
                { DESCRIPCION: 'Notes', name: 'descripcion' }
            ],
            //width: 100,//$("#jqgridDiv").width(),                
            rowNum: 100
    });//}).setGridWidth($("#jqgridDiv").width());
    

    //**************************** LISTADO DE GEOCERCAS ***********************************/
    var jqGridGeocercas = $("#jqGridGeocercas").jqGrid({
        url: '../controlador/geocercas.php',
        datatype: "json",
        loadonce : true,
        colModel: [
            {label: 'DESCRIPCION',name: 'DESCRIPCION',width: 150, key: true},
            {label: 'ID_TIPO_OBJ',name: 'ID_TIPO_OBJ',width: 75, align: "center"},
            {label: 'ID_PLANTILLA',name: 'ID_PLANTILLA',width: 75, align: "center"},
            {label: 'ID_RUTA',name: 'ID_RUTA',width: 75, align: "center"},
            {label: 'VEL_MAX',name: 'VEL_MAX',width: 75, align: "center"}
        ],
        loadonce: true,
        viewrecords: true,
        //width: $("#divGeocercasList").width(),// con jquery al abrir modal se extiende la tabla
        height: 300,
        rowNum: 50,
        rowList : [20,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        multiselect: true,
        pager: "#jqGridPagerGeocercas"
    });
    
    jqGridGeocercas.navGrid('#jqGridPagerGeocercas', { 
        edit: false, 
        add: false, 
        del: false,
        search: true,
        refresh: true,
        view: true,
        position: "left",
        cloneToTop: false 
    });

    jQuery("#jqGridGeocercas").jqGrid('setLabel', 'ID_TIPO_OBJ', '', {'text-align':'center'});
    jQuery("#jqGridGeocercas").jqGrid('setLabel', 'ID_PLANTILLA', '', {'text-align':'center'});
    jQuery("#jqGridGeocercas").jqGrid('setLabel', 'ID_RUTA', '', {'text-align':'center'});
    jQuery("#jqGridGeocercas").jqGrid('setLabel', 'VEL_MAX', '', {'text-align':'center'});
    
});

function getSelectedRows() {  
    var grid = $("#jqGridGeocercas");
    var rowKey = grid.getGridParam("selrow"); // Id de la columna seleccionada

    // -------------- Rows with checkbox selected --------------    
        if (!rowKey){
            alert("No rows are selected");
        }else {
            var selectedIDs = grid.getGridParam("selarrrow");

            for (var i = 0; i < selectedIDs.length; i++) {                
                var rowBoxCheck = grid.getRowData(selectedIDs[i]);

                var jObjectX= JSON.stringify(rowBoxCheck);//jobject es el array de objetos en string con el formato JSON                
                //console.log(jObjectX);//console.log("JSON written to Send the PHP server: "); 

                $.ajax({
                    type:'post',
                    cache:false,
                    url:"../controlador/traerGeocerca.php",
                    data:{jObject:  jObjectX},
                    success:function(server){
                     //console.log(server);//cuando reciva la respuesta lo imprimo                      
                      var geocercaData = JSON.parse(server);                      
                      //console.log(geocercaData);//console.log("Objeto retornado desde PHP:");
                      drawPolygon("green", geocercaData)
                    }
                });
            }
        }  
};

function drawPolygon(color, objGeocerca) { //objGeocerca: data de la geocerca traida    
    var geocercaIndex = arrayGeocercas.length; // Contador de geocercas traidas ...
    var geocercaID = objGeocerca.rows[0].DESCRIPCION;
    var triangleCoords = new Array();
    var bounds = new google.maps.LatLngBounds(); // Variable para hallar el centro del poligono ...

    for(var i=0; i < objGeocerca.rows.length - 1; i++) {
        var latx = objGeocerca.rows[i].LATITUD.replace(",",".");
        var lngx = objGeocerca.rows[i].LONGITUD.replace(",",".");
        triangleCoords.push( new google.maps.LatLng(latx, lngx ) );
        bounds.extend(new google.maps.LatLng(latx, lngx ));
    }        
    map.setCenter(bounds.getCenter());
    map.setZoom(16);

    arrayGeocercas[geocercaIndex] = new google.maps.Polygon({
        paths: triangleCoords,
        editable: false,
        strokeColor: '#165096',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#165096',
        fillOpacity: 0.7,
        name: geocercaID
    });
    arrayGeocercas[geocercaIndex].setMap(map);    

    google.maps.event.addListener(arrayGeocercas[geocercaIndex].getPath(), 'set_at', function() {
        var vertices = arrayGeocercas[geocercaIndex].getPath();        
    });

    google.maps.event.addListener(arrayGeocercas[geocercaIndex].getPath(), 'insert_at', function() {
        var vertices = arrayGeocercas[geocercaIndex].getPath();        
    });
    
    google.maps.event.addListener(arrayGeocercas[geocercaIndex], 'click', function(event) {        
        var vertices = arrayGeocercas[geocercaIndex].getPath();
            
        var contentString = "";

        for (var i =0; i < vertices.getLength(); i++) {
          var xy = vertices.getAt(i);
            contentString += '<tr>'+
                                '<td style="text-align:center; background-color:rgb(225, 226, 237);">' + i +'</td>'+
                                '<td style="text-align:center;">' + xy.lat() +'</td>'+
                                '<td style="text-align:center;">' + xy.lng() +'</td>'+
                            '</tr>';
        }

        var tabla =  '<table class="tableInfoW table table-hover table-condensed" style="font-size: 11px; margin-bottom: 10px; background-color:rgb(241, 244, 249);">' +
                        '<thead>'+
                          '<tr>'+
                            '<th style="text-align:center;">N°</th>'+
                            '<th style="text-align:center;">Latitud</th>'+
                            '<th style="text-align:center;">Longitud</th>'+
                          '</tr>'+
                        '</thead>'+
                        '<tbody>'+
                            contentString +
                        '</tbody>'+
                        '</table>';                        

        var html = '<div id="iw-container">' +
                    '<div class="iw-title" style="padding:10px;"><h4 style="text-align:center; margin:0px;">' + arrayGeocercas[geocercaIndex].name + '</h4></div>' +
                    '<div class="iw-content">' +                   
                      tabla +                      
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                  '</div>';

        var infowindow_coordenadas = new google.maps.InfoWindow({
            content: html, 
            maxWidth: 500
        });    

        infowindow_coordenadas.setPosition(event.latLng);
        infowindow_coordenadas.open(map);
        google.maps.event.addListener(infowindow_coordenadas, 'domready', function() {
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
    });
    // google.maps.event.addListener(arrayGeocercas[geocercaIndex], 'click', showPolygonInfo);
};
