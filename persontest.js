let jsonToCsv=(json)=>{
    var csv = '';
    json.forEach(element => {
        csv+=element+','
    });
    
    return csv.substring(0,csv.length-1);
}
let csvToJsonList=(csv)=>{
    var headers=csv.split(",");  
    return JSON.stringify(headers); 
}
var csv="college,tuition,spring2020"
var categories =[
    "college",
    "tuition",
    "spring2020",
]
console.log(jsonToCsv(categories))
console.log(csvToJsonList(csv))