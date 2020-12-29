import { Request, Response } from 'express'
import { youtube } from 'googleapis/build/src/apis/youtube'
import puppeteer from 'puppeteer'
import TwitterController from '@controllers/TwitterController'
import YoutubeController from './YoutubeController'
import { RequestWithTalent } from '@models/RequestWithTalent'

export default new class TalentController {
  public async pog (req: RequestWithTalent, res: Response) {
    const talent = req.talent

    await YoutubeController.syncYoutubeWithTableAll(talent)

    res.status(200).send('nice')
  }

  public async createBranch (req: Request, res: Response) {
    const {
      branchName
    } = req.query

    await YoutubeController.createBranch(branchName.toString())

    res.status(200).send('nice')
  }

  public async createTalent (req: Request, res: Response) {
    await YoutubeController.createTalent()

    res.status(200).send('nice')
  }

  public async find (req: RequestWithTalent, res: Response) {
    try {
      // Let the user edit that
      // Send page
      // And send the oldest from before
      let {
        show
      } = req.query
      const {
        page,
        previusOldest
      } = req.query
      const talent = req.talent

      show = JSON.parse(show.toString())

      console.log('show: ', show)

      Promise.resolve(await YoutubeController.syncYoutubeWithTable(talent.youtubeId.toString()))

      // Query youtube
      const resultYt = await YoutubeController.findAll(10, Number(page))
      // Oldest Date
      const oldest = resultYt.data.reduce((c, n) =>
        n.date < c.date ? n : c
      ).date.toISOString()

      var twitter = []

      if (show[0]) {
        twitter = TwitterController.parseTwitterResponsev2(
          await TwitterController.find(talent.twitterName.toString(), oldest, previusOldest?.toString())
        )
      }

      const result = [
        ...twitter,
        ...resultYt.data
      ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

      return res.status(200).send({
        result,
        oldest,
        count: resultYt.count
      })
    } catch (error) {
      console.log('error', error)
      return res.status(500).send({ error: JSON.stringify(error) })
    }
  }

  public liveStreams = async (req: Request, res: Response) => {
    try {
      const { channelId } = req.query
      if (!channelId) return res.status(500).send({ error: 'channelId required' })
      const urls = await this.getLiveUrls(channelId.toString())
      let result: any = null
      if (urls.length > 0) {
        result = await youtube('v3').videos.list({
          key: process.env.YOUTUBE_TOKEN,
          part: ['snippet'],
          id: urls.map(item => item.replace('/watch?v=', ''))
        })
      }

      return res.status(200).send({ result: result?.data })
    } catch (error) {
      return res.status(500).send({ error: JSON.stringify(error) })
    }
  }

  private async getLiveUrls (channelId: string): Promise<string[]> {
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      await page.goto(`https://www.youtube.com/channel/${channelId}/videos`)

      const result = await page.evaluate(() => {
        var videos = document.querySelectorAll('.ytd-grid-renderer .style-scope .ytd-thumbnail[overlay-style=LIVE]')
        const urls = Array.from(videos).map(v => (v.parentNode.parentNode as HTMLElement).getAttribute('href'))

        return urls
      })

      browser.close()
      return result
    } catch (error) {
      console.log(error)
      return [':(']
    }
  }
}()
