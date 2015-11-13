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