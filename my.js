const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
const maintab=document.querySelector("[data-maintab]");
const searchtab=document.querySelector("[data-searchtab]");
const allui=document.querySelector("[data-allui]");
const searchengine=document.querySelector("[data-searchengine]");
const loading=document.querySelector("[data-loadingscreen]");
const grantaccess=document.querySelector("[data-grantaccess]");
const userinfo=document.querySelector("[data-userinfocontainer]");

const error=document.querySelector("[data-error]");


let currenttab=maintab;
currenttab.classList.add("currenttabprop");
//intially kya hoga humey phele location persent hogi  ager nhi hogi to find krega 
//by showing grant access ui and get data of user from goelocation finder 

getfromSessionStorage();




//switch tab function
function switchtab(clickedtab){
    //agar currenttab vo nhi hai jisse click kiya 
    if(clickedtab !=currenttab){
   
       currenttab.classList.remove("currenttabprop");
       currenttab=clickedtab;
       currenttab.classList.add("currenttabprop");
     //ye sbb ui wala box mai change karey hai 
       if(!searchengine.classList.contains("active")){
        //search tab pe click kiya hai to search tab mai kuch kam karngey vo kam hai line no.186 pe
         searchengine.classList.add("active");
         grantaccess.classList.remove("active");
         userinfo.classList.remove("active");
       }
      else {
        searchengine.classList.remove("active");
        //serach karne per user info weather atta hai to usko bhi hid karna pdeg a
        userinfo.classList.remove("active");
        error.classList.remove("active");
        //ma tab ab dalanegy main or default weather data jo store hoga jab hum grant access ko allow krengey 
        getfromSessionStorage();
       }
   
     
    }

}
//click on tab
maintab.addEventListener("click",() =>{
    //click on maintab so now switch the tab according to click
    switchtab(maintab);
});

searchtab.addEventListener("click", () =>{
    //click on searchtab so now switch the tab according to click
    switchtab(searchtab);
});



function getfromSessionStorage(){
   
    const localCoordinates= sessionStorage.getItem("user-coordinates");
    //ager local cordinates nhi mille matylb access nhi diya
     //to access wali ui dekjha dengey  taki local cordinates mill jaye
    if(!localCoordinates){
       
        grantaccess.classList.add("active");
        //now we gave permission by clicking accesse button and usig geolocation api we render user lat and log
        //and pass it to session storage
        //at 80 
    }


    //ager miil gaye coordinates
    //to api call kar dengey
   // taki data mil jaye or hum main wla emai show kar de
   else{
   //cordinates mill gay eto cvhange karna hai json mai
    const coordinates=JSON.parse(localCoordinates);

    //send coordinates to fetch from api
    fetchuserweatherinfo(coordinates);
    
   }

}
//if grant access wala button clicked
const button=document.querySelector("[data-grantbutton]");
button.addEventListener('click',geolocationfinder);


//
function geolocationfinder(){
    //first thing first we check if geolocation api supported hai ki nhi 
    //

    if(navigator.geolocation){
//navigator.geolocation.getCurrentPosition api hai ye
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    //ager supported nhi hai to alert de dena
    else{
   alert("no acceseble");
    }
 }
 function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    //coordinate mil gaye to fetch karao api se or data lo na
    fetchuserweatherinfo(userCoordinates);

}






//wait for api response we use async fun
async function fetchuserweatherinfo(coordinates){
    
    //found long and lat from coordinates that are passed form seession storage after conversion
    const {lat, lon}=coordinates;
   
    //grant access wale koi ab chupadengey
    grantaccess.classList.remove("active");
    //loader on kr dengey jab tak data milta hai 
    loading.classList.add("active");
    //api call
    //if api call failes to error bhi to dekhna hai
try{
  
    const response= await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
 
        const data= await response.json();
    //noe loader hatha doi
  
    loading.classList.remove("active");
    
    // found data now show data in main ui ie. now active userdatainfo
    // kha sw shuru kiya tha kik ager main wala click hua to main ka default ui dekhna hai uske liye data chaiye 
    // data vailable ha to fetch wale function ko call karo jisme hum,m abhui hai jo abb data dekhayega 
    // ager nhi mill data to grant access wali ui ko dekha denguye 
    userinfo.classList.add("active");
  
    // visible karaa diya
    // abb ui ke ander data ko reder kr dengey

    renderweatherinfo(data);
    //data se value nikal ke ui pe dekhayega



}
   

catch(err){

 loading.classList.remove("active");
//
userinfo.classList.remove("active");
error.classList.add("active");
}
}


function renderweatherinfo(data){
    
    //render html element on which we add data
   const city =document.querySelector("[data-cityname]");
   const flag=document.querySelector("[data-countryflag]");
   const description=document.querySelector("[data-weatherdescription]");
   const weathericon=document.querySelector("[data-weathericon]");
   const temp=document.querySelector("[data-temp]");
const image=document.querySelector("[data-new]");
   const windspeed=document.querySelector("[data-windspeed]");
   const humidity=document.querySelector("[data-humidity]");
   const cloud =document.querySelector("[data-cloud]");
//now add data in ui 

 city.innerText=data?.name;
 flag.src=`https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;

 description.innerText=data?.weather?.[0]?.description;
 weathericon.src =`http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
 temp.innerText = `${data?.main?.temp}°C`;
 windspeed.innerText = `${data?.wind?.speed}%`;
 humidity.innerText = `${data?.main?.humidity}%`;
 cloud.innerText = data?.clouds?.all;
 

}



///
//serach a city from form input 
//and show a same default ui for a new city which we search





const citysearch= document.querySelector("[data-searchInput]");

searchengine.addEventListener("submit" ,(e)=>{
    e.preventDefault();
    let cityname=citysearch.value;
    if(cityname===""){
    return;
    }
    else
        //if serch a new city
        //senf city name to api
        //1st api call kiya tha jab hum main default tab mai ja rhe the to 
        //vha jo user ka dafault coordinates hai usse api mai bhej rhe the 
        //but abb hum new city ka data ui ,mai dekha rhe hai to uske liye data chauye jo api call se milega
        //fhir hum uss data ko ui mai render karra dengey render function se 


        //next api call now
        fetchnewcitydata(cityname);
    
})


//api call
async function fetchnewcitydata(newcity){
loading.classList.add("active");
userinfo.classList.remove("active");
grantaccess.classList.remove("active");
try{
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${newcity}&appid=${API_KEY}&units=metric`
      );
    const data= await response.json();
    const check=data?.name;
  if(check.value="undefined"){
    loading.classList.remove("active");
    error.classList.add("active");
  }
  error.classList.remove("active");
    loading.classList.remove("active");
   userinfo.classList.add("active");
   renderweatherinfo(data);
  
}
catch(e){
    loading.classList.remove("active");
    userinfo.classList.remove("active");
    error.classList.add("active");
    
}
}


