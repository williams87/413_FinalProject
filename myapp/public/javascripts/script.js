var zips = [85700, 85701, 85702];
var serverLink = document.getElementById("serverLink").href; 

for (var zip = 0; zip < zips.length; zip++) {
   var xhr = new XMLHttpRequest();
   xhr.addEventListener("load", myHandler);
   xhr.responseType = "json"
   xhr.open("GET", serverLink + "lab/status?zip=" + zips[zip]);
   //xhr.open("GET", serverLink + /info.html); 
   xhr.send();
}