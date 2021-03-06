package app.controllers

import models.{Manager, ManagerDAO}
import org.mindrot.jbcrypt.BCrypt
import org.scalatest._
import Matchers._
import play.api.libs.json._
import play.api.mvc._
import play.api.test.FakeRequest
import play.api.test.Helpers._
import play.api.test._
import seeders.ManagersSeeder
import ManagersSeeder.{admin, managerOne, managerTwo}
import Json.toJson
import internal.PostgresDriverExtended.api._
import utility.{FakeAuthenticatedRequests, FakeAppPerSuite}

class ManagersTest extends FakeAppPerSuite with FakeAuthenticatedRequests {

  before {
    await(ManagersSeeder.clean)
    await(ManagersSeeder.seed)
  }

  def controller = new controllers.Managers

  def emptyAjaxRequest(merthod: String = "GET", url: String = "/"): FakeRequest[AnyContentAsEmpty.type] =
    FakeRequest(merthod, url).withHeaders(("X-Requested-With", "XMLHttpRequest"))

  def unauthorizedRequest = emptyAjaxRequest()

  def jsonUnauthorizedRequest = unauthorizedRequest.withJsonBody(JsNull)

  def jsonManagerRequest = managerRequest().withJsonBody(JsNull)

  def jsonAdminRequest = adminRequest().withJsonBody(JsNull)
  
  def managerFromDb(email: String): Option[Manager] = await(ManagerDAO.byEmail(email))

  def managerFromDb(manager: Manager): Option[Manager] = managerFromDb(manager.email)

  def managerId(mngr: Manager) = managerFromDb(mngr).get.id

  def managersCount = await(dbConfig.db.run(ManagerDAO.all.length.result))

  /**
   * Tests for auth policy for all actions except ''ManagersImpl.changePassword''
   * ~~~~
   */
  "Managers controller auth policy" must {
    "accept 'list' request only for admin" in {
      status(controller.list.apply(unauthorizedRequest)) mustBe UNAUTHORIZED
      status(controller.list.apply(managerRequest())) mustBe UNAUTHORIZED
      status(controller.list.apply(adminRequest())) should not equal UNAUTHORIZED
    }

    "accept 'store' request only for admin" in {
      status(call(controller.store, jsonUnauthorizedRequest)) mustBe UNAUTHORIZED
      status(call(controller.store, jsonManagerRequest)) mustBe UNAUTHORIZED
      status(call(controller.store, jsonAdminRequest)) should not equal UNAUTHORIZED
    }

    "accept 'update' request only for admin" in {
      status(call(controller.update(1), jsonUnauthorizedRequest)) mustBe UNAUTHORIZED
      status(call(controller.update(1), jsonManagerRequest)) mustBe UNAUTHORIZED
      status(call(controller.update(1), jsonAdminRequest)) should not equal UNAUTHORIZED
    }

    "accept 'grantAdmin' request only for admin" in {
      status(call(controller.grantAdmin(1), jsonUnauthorizedRequest)) mustBe UNAUTHORIZED
      status(call(controller.grantAdmin(1), jsonManagerRequest)) mustBe UNAUTHORIZED
      status(call(controller.grantAdmin(1), jsonAdminRequest)) should not equal UNAUTHORIZED
    }

    "accept 'revokeAdmin' request only for admin" in {
      status(call(controller.revokeAdmin(1), jsonUnauthorizedRequest)) mustBe UNAUTHORIZED
      status(call(controller.revokeAdmin(1), jsonManagerRequest)) mustBe UNAUTHORIZED
      status(call(controller.revokeAdmin(1), jsonAdminRequest)) should not equal UNAUTHORIZED
    }

    "accept 'delete' request only for admin" in {
      status(call(controller.delete(1), jsonUnauthorizedRequest)) mustBe UNAUTHORIZED
      status(call(controller.delete(1), jsonManagerRequest)) mustBe UNAUTHORIZED
      status(call(controller.delete(1), jsonAdminRequest)) should not equal UNAUTHORIZED
    }
  }

  /**
   * Functional tests for CRUD actions.
   * ~~~~
   */

  case class ManagerStore(fullName: String, email: String, password: String)

  case class ManagerList(fullName: String, email: String, isAdmin: Boolean)

  case class ManagerUpdate(fullName: String, email: String)

  implicit val writesManagerStore = Json.writes[ManagerStore]

  implicit val managerListReads = Json.reads[ManagerList]

  implicit val writesManagerUpdate = Json.writes[ManagerUpdate]

  implicit val writesManager = Json.writes[Manager]

  val newMngrStr = ManagerStore("New Manager", "new@example.net", "new")

  def checkMatch(m: Manager, mr: ManagerStore) = {
    m.fullName mustBe mr.fullName
    m.email mustBe mr.email
    assert(BCrypt.checkpw(mr.password, m.passwordHash))
  }

  "Manager controller CRUD" must {
    "list managers but without password information" in {
      val response = controller.list.apply(adminRequest())
      status(response) mustBe OK
      contentAsJson(response).validate[Seq[ManagerList]] match {
        case r: JsSuccess[Seq[ManagerList]] => {
          val seq = r.get
          seq.length mustBe 3
          val adm = seq.find(_.email == admin.email).get
          adm.fullName mustBe admin.fullName
          adm.email mustBe admin.email
          val json = contentAsJson(response)
          (json(1) \ "password").asOpt[String] mustBe None
          (json(1) \ "passwordHash").asOpt[String] mustBe None
        }
        case err: JsError => fail("Invalid response format")
      }
    }

    "list one manager on show request" in {
      val response = controller.show(managerId(managerOne)).apply(adminRequest())
      status(response) mustBe OK
    }

    "create new manager record when data valid" in {
      val result = call(controller.store, adminRequest().withBody(toJson(newMngrStr)))
      status(result) mustBe OK
      managerFromDb(newMngrStr.email) match {
        case Some(mgr: Manager) => checkMatch(mgr, newMngrStr)
        case None => fail("record is absent")
      }
    }

    "reject creating new manager record with non-unique email" in {
      val recordsBefore = managersCount
      val mngrStr = ManagerStore("New Manager", managerOne.email, "no matter")
      val result = call(controller.store, adminRequest().withBody(toJson(mngrStr)))
      status(result) mustBe CONFLICT
      recordsBefore mustBe managersCount
    }

    "update manager when data valid and email unique" in {
      val oldMngr = managerOne
      val updtdMngr = ManagerUpdate("Another Fullname", "another@example.net")
      val result = call(controller.update(managerId(oldMngr)), adminRequest().withBody(toJson(updtdMngr)))
      status(result) mustBe OK
      managerFromDb(oldMngr) mustBe None
      managerFromDb(updtdMngr.email) match {
        case Some(mngr) => {
          mngr.fullName mustBe updtdMngr.fullName; mngr.email mustBe updtdMngr.email
        }
        case None => fail("updated manager is absent")
      }
    }

    "reject updating manager when it breaks unique email constraint" in {
      val oldMngr = managerTwo
      val updtMngr = ManagerUpdate("Some fullname", admin.email)
      val result = call(controller.update(managerId(oldMngr)), adminRequest().withBody(toJson(updtMngr)))
      status(result) mustBe CONFLICT
    }

    "delete manager when he isnt admin" in {
      assertResult(managersCount - 1) {
        val result = call(controller.delete(managerId(managerTwo)), adminRequest())
        status(result) mustBe OK
        managersCount
      }
    }

    "reject delete manager when he is admin" in {
      assertResult(managersCount) {
        val result = call(controller.delete(managerId(admin)), adminRequest())
        status(result) mustBe CONFLICT
        managersCount
      }
    }
  }

  "Managers controller also" must {
    "reject revoke admin privileges when there is only one admin" in {
      val result = call(controller.revokeAdmin(managerId(admin)), adminRequest())
      status(result) mustBe CONFLICT
      managerFromDb(admin).get.isAdmin mustBe true
    }

    "revoke admin privileges when there are multiple admins" in {
      val scndAdmn = Manager(0, "Admin Number Two", "admin2@example.net", ManagersSeeder.hashPassword("admin2"), true)
      await(dbConfig.db.run(ManagerDAO.all += scndAdmn))
      val oldAdmn = admin
      var result = call(controller.revokeAdmin(managerId(oldAdmn)), adminRequest())
      status(result) mustBe OK
      managerFromDb(oldAdmn).get.isAdmin mustBe false
    }

    "grant admin privileges to manager" in {
      val mngr = managerOne
      val result = call(controller.grantAdmin(managerId(mngr)), adminRequest())
      status(result) mustBe OK
      managerFromDb(mngr).get.isAdmin mustBe true
    }
  }

  val changePasswordBody = Json.parse( """{"password":"anotherPassword"}""")

  "Managers controller password change" must {
    "be rejected when manager changes password of another manager" in {
      var request = managerRequest(managerOne).withBody(changePasswordBody)
      var result = call(controller.changePassword(managerId(managerTwo)), request)
      status(result) mustBe UNAUTHORIZED
      val passwordHash = managerFromDb(managerTwo).get.passwordHash
      BCrypt.checkpw(ManagersSeeder.passwordOf(managerTwo), passwordHash) mustBe true
    }

    "be accepted when manager changes his own password" in {
      val request = managerRequest(managerOne).withJsonBody(changePasswordBody)
      val result = call(controller.changePassword(managerId(managerOne)), request)
      status(result) mustBe OK
      val passwordHash = managerFromDb(managerOne).get.passwordHash
      BCrypt.checkpw("anotherPassword", passwordHash) mustBe true
    }

    "be accepted when admin changes somebody`s password" in {
      val request = adminRequest().withJsonBody(changePasswordBody)
      val result = call(controller.changePassword(managerId(managerOne)), request)
      status(result) mustBe OK
      val passwordHash = managerFromDb(managerOne).get.passwordHash
      BCrypt.checkpw("anotherPassword", passwordHash) mustBe true
    }
  }
}
