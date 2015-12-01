var when = require('when');
var _ = require('lodash');

test();

// function test() {
//   var promises = [];

  // promises.push(restful()); // response1
  // promises.push(restful()); // response2
  // promises.push(restful()); // response3

  // when.all(promises) 
  //   .then(function(responses) {
  //       console.log({
  //         response1: responses[0],
  //         response2: responses[1],
  //         response3: responses[2]
  //       });
  //   });

//   when.any(promises) 
//     .then(function(firstResponse) {
//         console.log(firstResponse);
//     }, errorHandler);
  // fetchFromDB()
  //   .then(gotOnce) //19
  //   .then(restful)
  //   .otherwise(handleError)
  //   .ensure(cleanUp); // cleanup

//   // // promise
//   // //   .then(gotDiff);// 0
// }

// function fetchFromDB() {
//   var deferred = when.defer();

//   cloudantCall(function(err, value) {
//     if(err) {
//       deferred.reject(err);
//     }

//     deferred.resolve(value);
//   });

//   return deferred.promise;
// }

// var counter = 0;
// function restful() {
//   var deferred = when.defer();

//   restfulCall(function(err, value) {
//     if(err) {
//       deferred.reject(err);
//     }

//     counter++;
//     deferred.resolve(value + ' ' + counter);
//   });

//   return deferred.promise;
// }

// function cloudantCall(callback) {
//   // callback(new Error(':('));
//   callback(undefined, 19);
// }

// function restfulCall(callback) {
//   // callback(new Error(':('));
//   callback(undefined, 'restful response');
// }

// function gotOnce(number) {
//   console.log(number);
//   return number;
// }

// function gotAgain(number) {
//   console.log(number+1);
//   return number;
// }

// function gotDiff(number) {
//   console.log(0);
// }

// function handleError(err) {
//   console.log(err.message);
// }

// function cleanUp() {
//   console.log('Clean up');
// }

function test() {
  arrPromise()
    .then(filterOdds)
    .then(print);
}

function arrPromise() {
  var deferred = when.defer();
  deferred.resolve( [1,2,3,4] );

  return deferred.promise;
}

function errorPromise() {
  var deferred = when.defer();
  // deferred.reject(new Error('Couldn\'t resolve promise'));
  deferred.resolve('val');

  return deferred.promise;
}

function filterOdds(values) {
  return _.filter(values, function(n) { 
    return n %2 === 0; 
  });
}

function print(str) {
  console.log(str);
}