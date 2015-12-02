# Simplifying Asynchronous Node code with When.JS

## What is a promise? 

Let's define promises as a design pattern used to simplify asynchronous code. Promises are also known as futures or delays. You can see full details of the promise pattern on the [Mozilla docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) or [Wikipedia](https://en.wikipedia.org/wiki/Futures_and_promises); but the simple explanation is that your operations/functions return a promise object which in essence a placeholder for the actual result that is being computed asynchronously. Promise objects provide two important APIs: 

1. `.then(func)`: this sets the function to be executed when the promises is fufilled. *func* expects one parameter which is the value being computed asynchronously.
2. `.catch(func)` or `otherwise(func)`: this sets the function to be executed when an error happens while trying to fulfill the promise. In this case *func* is a function expects one parameter, the error that occurred.

## Promises with When.JS

When using When.JS you actually work with *deferred* objects which provide a promise as well as resolution methods. Let's write a simple asynchronous using callbacks and rewrite it returning a promise. One thing  worth noticing is that the code below is provided to compare and contrast, we will highlight the benefits of promises later. 

Callback form:

```
function asyncRandomCallback(cb) {
	setTimeout(function() {
		var num = 3; // randomly picked by my kid
		cb(undefined, num);
	}, 1000);
}

asyncRandomCallback(function(err, rand) {
	console.log(rand);
})
```

Promise form:

```
var when = require('when');


function asyncRandomNumber() {
	// step 1: create a deferred object
	var deferred = when.defer();
	
	setTimeout(function() {
		var num = 27; // randomly picked by my wife
	
		// step 3: after 1 second resolve our promise. 
		deferred.resolve(num);
	}, 1000);
	
	// step 2: return the promise of our deferred value
	return deferred.promise;
}

asyncRandomNumber()
	.then(function(err, rand) {
		console.log(rand);
	});
``` 

## Promises Chaining

When creating a complex application you would probably run into a scenario that requires multiple asynchronous operations to occur sequentially. For example one needs to do a read from the database, use that data fetched to do some computation, and then save the results to the database. When working with callbacks this will require nesting callback which not only makes your code base a pain to maintain but also makes _"eating errors"_ fairly easy. Promises solve this problem by the use of _chaining_. `.then(func)` returns a promise of the value returned by _func_, if _func_ returns a promise it will return `.then(func)` will return the same promise. We can leverage this to achieve our sequential example with code shown below: 

```
// readFromDB asynchronously fetches data from the database and returns a promise
readFromDB(query)
	// for this example lets assume all rows have just interger value.
	.then(function(rows) {
		var sum = 0;
		for(var i = 0; i < rows.length; ++i) {
			sum += rows[i].value;
		}		
		return sum;
	)
	// writeToDB is a function that takes an integer and writes it to a database asynchronously. 
	// This function could return a promise or not.
	.then(writeToDB)  
```

## Error Handling

One thing you will notice immediately in our previous example is that we completely ignore error handling. In a real world scenario, we wouldn't take a database operation. To notify an error, our asynchronous functions can call `deferred.reject(new Error())` at any point of their execution. If `.reject(err)` is called, then function passed to `promise.otherwise(func)` will be executed. While `.otherwise(func)` is an attribute of a single promise object, you can actually leverage the same error handler for a whole promise chain. This is great because it makes it harder to _eat errors_ and because simplifies the implementation of in-memory transactions. Now let's add error handling to our previous example while comparing it to a try/catch syntax.

```
readFromDB(query)
	.then(inMemoryOp)
	.then(writeToDB)  
	.othewise(functionfunction(err) {
		console.log("Some broke and we got this error " + err);
		console.log("So this is basically a 'catch' block");
	})
	.ensure(function() {
		console.log("This will always be executed. So basically a 'finally' block");
	})
```

## Fancy Stuff 

So far we have been returning promises but we have just been chaining them. While _When.JS_ makes the creationg of promises very simple the cooler part of _when_ is what it allows you to do with the promises. Mainly what you can do with its operator: `.all(promiseArr, func)`, `.any(promiseArr, func)`, `.some(promiseArr, n, func)`. Let's see an example:

```
var when = require('when');

var promises = [];
promises.push(readFromDB(query1));
promises.push(readFromDB(query2));
promises.push(readFromDB(query3));

when.all(promises, function(results) {
	console.log("rows for query1 " + results[0]);
	console.log("rows for query2 " + results[1]);
	console.log("rows for query3 " + results[2]);
})
```

In the code above we perform three asynchronous queries to the database and then receive all the results together in order. Achieving this with callbacks would look pretty messy and `when.all()` actually returns a promise so we can do error handling as described before. `any()` and `some()` work on a similar matter, `some()` returns the first _n_ results in order and cancels the rest `any()` only returns the result of the first promise to be fulfilled. For further explanation on these functions check out the [Examples](https://github.com/cujojs/when/wiki/Examples) on the _When.JS_ repo's wiki.

# Conclusion

With this simple introduction, you are ready to start using promises in your project. Now you  simplify your codebase by removing nested callbacks, reduce the possibility of human error by simplifying your error handling, leverage chaining for sequential asynchronous calls and in memory transactions, and achieve fancier asynchronous behavior with the power of _when's_ functions.  If you would like to keep reading on promises Brian Cavalier wrote a great series of post on the topic called [Async Programming](http://blog.briancavalier.com/async-programming-part-1-it-s-messy/) also _When.JS'_ [wiki](https://github.com/cujojs/when) has some good content too.
