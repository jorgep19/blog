# How to Run a Scala Web App on IBM Bluemix

[Scala](http://www.scala-lang.org/) is a very interesting programming language that provides an elegant mix of Object Oriented and Functional ideas. It was designed to be a *Scalable Language* which makes it great for web. Its currently being used in the back-end of very popular applications like *Twitter* and *Linkedin*. 

This *tutorial* will walk you through creating a simple web app in Scala leveraging the [Play Framewok](https://www.playframework.com/) and how to host it on [IBM Bluemix](https://console.ng.bluemix.net/). No experience wiuth this technologies is needed to complete this tutorial but is written with the hopes to motivate you to explore further (links at the end).

## Setup 

1. Install the [JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
2. Install [SBT](http://www.scala-sbt.org/download.html) from their site or if you are a [Homebrew](http://brew.sh/) user you can do `brew install sbt`. *SBT* is a build tool for Scala and Java projects
3. Install the [Cloud Foundry CLI](https://github.com/cloudfoundry/cli) (Command Line Interface): this command line tool enable use to interact with IBM Bluemix from your terminal.
4. If desired setup your prefered code editor or IDE for scala development.


## Implement a Web Server using Play 

Here we'll do a quick run of what is fully described in the "Getting Started" section of the Play Framework documentation (the link is provided at the end of the post in case you want extra details). 

First, let's create a quick project structure as described below. If you are using an IDE when it will probably do this for your when  creating an SBT project. For convinience this [shell script](https://github.com/jorgep19/blog/blob/master/RunScalaOnBluemix/setup.sh) is provided in case you are creating the directories the old way.

```
/
 └ app/
 	└ controllers/
 		└ Main.scala
 └ conf/
 	└ application.conf
 	└ routes
 └ project/
 	└ application.conf
 	└ plugins.sbt 
 └ build.sbt and
 └ manifest.yml 
```


### Setting up Play Framework with SBT

The *Play Framework* provides a CLI named `activator` that can be use create, manage, build, and deploy applications. However, this provide an extra layer of depency on the framework that might not be a ideal. For this reason, the framework can also be integrated to a project as an SBT plugin. To setup this plugin in our project we will edit three files

* `/project/build.properties`: this file holds configuration for SBT in our case we just need to specify the SBT version we need for our project.
<pre>
sbt.version = <b>0.13.8</b>
</pre>

* `/project/plugins.sbt`: this file allows us to provide our SBT process with plugins. The two bolded lines in the file specify the repository where SBT can get the *Play Framework* plugin and then it adds it to our build process.  
<pre>
logLevel := Level.Warn

// The Typesafe repository
<b>resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/releases/"</b>

// Use the Play sbt plugin for Play projects
<b>addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.4.0")</b>
</pre>

* `/build.sbt`: this file is where our project's build is described, it is analogus to a *build.gradle* file when using [Gradle](http://gradle.org/). The bolded line is what explicitly tells SBT that we need the *Play Framework* plugin.

<pre>
name := "scalaOnBluemix"

version := "1.0"

scalaVersion := "2.11.7"

<b>lazy val root = (project in file(".")).enablePlugins(PlayScala)</b>
</pre>


### Implementing the Web Server

So far we have only done the setup for the project in this step we will actually implement our simple web app. We will accomplish this by editing the following files: 

* `/app/controllers/Main.scala`: *controllers* in the context of *Play* are the entry point to our application through the *actions* they can perfom. Both concepts represented in the `Controller` and `Action` classes provided by *Play*. Our *Main* controller has a simple Action the fetch an application variable, `my.env.var`concatinates it to a message an return a JSON with properties `status` and `message`.

```
package controllers

import play.api.libs.json.Json
import play.api.mvc._
import play.api.Play.current

object Main extends Controller {
  var hello = Action {
    val envVar = current.configuration.getString("my.env.var").get
    val msg = "Server is Running " + envVar
    val response = Json.obj("status" -> "OK", "message" -> msg)

    Ok(response)
  }
}
```

* `/conf/application.conf`: this file is the place where we can put application configuration, this includes variables, database connection, etc. In our case we have a configuration variable (which we retrieve in our Main doing `current.configuration.getString("my.env.var").get`) that gets is value from the enviroment variable `MY_VAR`

```
my.env.var=${MY_VAR}
```

* `/conf/routes`: this file is what *Play* uses to map our application URLs to our *controllers' actions* . Notice that the our action `hello` is refered by is **fully qualified name**. As you would expect *Play Framework* supports  setup for routes that expect parameters and support all the http methods but for this tutorial we are keeping it simple.

```
`GET / controllers.Main.hello()`
```

### Running our Server

At this point our simple web app is ready all we need to do is run our server. To do this go to the root directory of the project and run `sbt compile` and then `sbt run`. Now you can go on your browser to `http://localhost:9000/` and expect JSON similar to:


```
{
status: "OK",
message: "Server is Running "
}
```

### Deploying to IBM Bluemix

Now that we have a working web app all we need to do is hosted and share it our url so the work can enjoy our master piece. We will do this by deploying our app to IBM Bluemix following this steps.

1. Fill our `/manifest.yml` so that it look similar to the one shown below. Replace `you_creative_name_goes_here`'s with... you guess it your creative name for our web app (this will also be the suffix to your bluemix url). The other bolded parts are just important pieces of information:
	1. `java_buildpack`: this tells Bluemix that we want to use the standard Cloud Foundry Java buildpack this is the key to getting our app to run on Bluemix. If this doesn't make sense feel to search "Cloud Foundry Buildpacks" online but know that this what enables us to get on Bluemix.
	2. `./target/universal/scalaOnBluemix.zip` this is the path to the ready-to-deploy-packaged version of our server. We will actually create this zip file in step 2.
	3. `MY_VAR: random_variable value`: this will create the environment variable in our Bluemix deployment so that our *Main* controller can get it.

<pre>
applications:
  - host: <b>you_creative_name_goes_here</b>
    name: <b>you_creative_name_goes_here</b>
    buildpack: <b>java_buildpack</b>
    path: <b>./target/universal/scalaOnBluemix.zip</b>
    instances: 1
    memory: 512M
    env:
      <b>MY_VAR: random_variable value</b>
</pre>

2. Go to the root of the project on your terminal and run `sbt dist` to create an application zip in as mentioned in our *manifest.yml* file this will be in `{projectRoot}/target/universal/scalaOnBluemix.zip`.


3. In your terminal stay in the root of the project and run 
	1. `cf api https://api.ng.bluemix.net`: this congifures the Cloud Foundry CLI so that it know you will be interacting with IBM Bluemix. 
	2. `cf login` and then enter your credential so Bluemix verifies that it is you talking through the CLI.  
	3. `cf push`: this will actually take the app and host it on Bluemix. After running this command wait a for output similar to the one below. Finally go on your browser to your bluemix url and see our master piece available to the worl online.
	
<pre>
requested state: started
instances: 1/1
usage: 512M x 1 instances
urls: <b>scala_server.mybluemix.net</b>
last uploaded: Thu Nov 12 22:15:40 UTC 2015
stack: cflinuxfs2

     state     since                    cpu    memory           disk           details   
0   running   2015-11-12 04:16:38 PM   0.0%   233.3M of 512M   150.7M of 1G   
</pre>

## Keep Exploring

As mentioned before this is just an entry point now that we have a web app on Bluemix we want to start implementing new features for it. Here are some links to continue learning Scala and the Play Framework to enable us to implement our ideas.a 

* [Functional Programming Principles in Scala](https://www.coursera.org/course/progfun) class on [Coursera.org](https://www.coursera.org/). IT'S FREE! and the instructure is trully great.
* [Programming in Scala](http://www.amazon.com/Programming-Scala-Comprehensive-Step-Step/dp/0981531644) is the book recommended for the class mentioned above. It's pretty thick but it is a good and comprenhensive introduction to the Scala world.
* [Play Framework website's Getting Started](https://www.playframework.com/documentation/2.4.x/Home) if you want to explore the framework further on of the best things they got is their docs.
