import { controller, httpPost, httpGet, interfaces, requestParam, httpDelete } from "inversify-express-utils";
import express from "express";
import { ReportingBaseController } from "./ReportingBaseController"
import { Report } from "../models"
import { Permissions } from '../helpers/Permissions'

@controller("/reports")
export class ReportController extends ReportingBaseController {

    @httpGet("/:id")
    public async get(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
        return this.actionWrapper(req, res, async (au) => {
            if (!au.checkAccess(Permissions.reports.edit)) return this.json({}, 401);
            else return this.repositories.report.convertToModel(au.churchId, await this.repositories.report.load(au.churchId, id));
        });
    }

    @httpGet("/")
    public async getAll(req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
        return this.actionWrapper(req, res, async (au) => {
            if (!au.checkAccess(Permissions.reports.edit)) return this.json({}, 401);
            else return this.repositories.report.convertAllToModel(au.churchId, await this.repositories.report.loadAll(au.churchId));
        });
    }

    @httpPost("/")
    public async save(req: express.Request<{}, {}, Report[]>, res: express.Response): Promise<interfaces.IHttpActionResult> {
        return this.actionWrapper(req, res, async (au) => {
            if (!au.checkAccess(Permissions.reports.edit)) return this.json({}, 401);
            else {
                const promises: Promise<Report>[] = [];
                req.body.forEach(report => { report.churchId = au.churchId; promises.push(this.repositories.report.save(report)); });
                const result = await Promise.all(promises);
                return this.repositories.report.convertAllToModel(au.churchId, result);
            }
        });
    }

    @httpDelete("/:id")
    public async delete(@requestParam("id") id: string, req: express.Request<{}, {}, null>, res: express.Response): Promise<interfaces.IHttpActionResult> {
        return this.actionWrapper(req, res, async (au) => {
            if (!au.checkAccess(Permissions.reports.edit)) return this.json({}, 401);
            else await this.repositories.report.delete(au.churchId, id);
        });
    }

}
