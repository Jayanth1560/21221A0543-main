const express=require('express');
const axios=require('axios');
const app=express();
const port=3001;

const windowSize=10;
let windowNums=[];
let lastReqTime=0;

//Function1 - to fetch numbers from server - fetchNum()
const fetchNum=async(numberId)=>{
    if(Date.now()-lastReqTime>500){
        try{
            const res=await axios.get(`http://localhost:3001/numbers/e/${numberId}`);
            if(res.status === 200){
                lastReqTime=Date.now();
                return res.data.numbers;
            }
        }catch(err){
            console.error('Error while fetching numbers',err);
        }
    }
    return null;
};

//Function2 - to calculate avg of nums - calAvg().   
const calAvg=(numbers)=>{
    if(numbers && numbers.length>0){
        const sum=numbers.reduce((prev,curr)=>prev+curr,0);
        return sum/numbers.length;
    }
    return 0;
};

//Routing
app.get('/numbers/e/:numberId',async(req,res)=>{
    const numberId=req.params.numberId;
    const newNumbers=await fetchNum(numberId);
    if(newNumbers === null){
       return res.status(500).json({error:'Error while fetching numbers'});
    }

    // Add new numbers to window.
    newNumbers.forEach(num=>{
        if(!windowNums.includes(num)){
            windowNums.push(num);
            if(windowNums.length>windowSize){
                windowNums.shift();
            }
        }
    });


    //Calculate avg of window.
    const avg=calAvg(windowNums);

    //Response
    const response={
        numbers: newNumbers,
        windowPrevState:[...windowNums],
        windowCurrState:windowNums,
        avg:avg.toFixed(2)
    };
    res.json(response);
});






app.listen(port,()=>{
    console.log(`Server is listening on port: http://localhost:${port}/numbers/e`);
});

