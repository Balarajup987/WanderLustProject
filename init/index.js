const mongoose=require("mongoose");
const initData=require("./data.js");

const mongo_db="mongodb://127.0.0.1:27017/wanderlust";

const Listing=require("../models/listing.js");

main()
.then(()=>{
    console.log("database connected");
})
.catch((err)=>{
    console.log(err);
});

async function  main(){
    await mongoose.connect(mongo_db);
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"68ad9b44f2d07df599d9129a"}));
    await Listing.insertMany(initData.data);

    console.log("data was initialized");
}

initDB();