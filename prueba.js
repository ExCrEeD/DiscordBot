function fnCall(fn, ...args)
{
  let func = (typeof fn =="string")?window[fn]:fn;
  if (typeof func == "function") func(...args);
  else throw new Error(`${fn} is Not a function!`);
}


function example1(arg1){console.log(arg1)}
function example2(arg1, arg2){console.log(arg1 + "  and   " + arg2)}
function example3(){console.log("No arguments!")}

fnCall("example1", "test_1");
fnCall("example2", "test_2", "test3");
fnCall(example3);