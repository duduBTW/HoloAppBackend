import { Request, Response } from 'express'
import { youtube } from 'googleapis/build/src/apis/youtube'
import puppeteer from 'puppeteer'
import TwitterController from '@controllers/TwitterController'
import YoutubeController from './YoutubeController'
// import reusltItem from '@models/ResultItem'
// import { addDays } from 'date-fns'
// import { User } from '@models/User'

export default new class TalentController {
  public async find (req: Request, res: Response) {
    try {
      // Let the user edit that
      const {
        channelId,
        twitterName
        // , nextPageYt,
        // , lastOldest
      } = req.query

      Promise.resolve(await YoutubeController.syncYoutubeWithTable(channelId.toString()))

      // const userY = await youtube('v3').channels.list({
      //   id: [channelId.toString()],
      //   part: ['contentDetails'],
      //   key: process.env.YOUTUBE_TOKEN
      // })

      // const resultApiY = await youtube('v3').playlistItems.list({
      //   playlistId: userY.data.items[0].contentDetails.relatedPlaylists.uploads,
      //   part: ['snippet'],
      //   key: process.env.YOUTUBE_TOKEN,
      //   maxResults: 10,
      //   pageToken: nextPageYt === null || nextPageYt === undefined ? null : nextPageYt.toString()
      // })

      // var youtubeParsed = YoutubeController.parseYoutubeResponse(resultApiY)
      // var teste = await YoutubeController.save(youtubeParsed)

      // console.log('teste', teste)
      // Query youtube
      const resultYt = await YoutubeController.findAll()
      // Oldest Date
      const oldest = resultYt.data.reduce((c, n) =>
        n.date < c.date ? n : c
      ).date.toISOString()

      // var twitterParsed = TwitterController.parseTwitterResponse(await (await TwitterController.find(twitterName.toString(), oldest)).data)

      var twitter = TwitterController.parseTwitterResponsev2(await (await TwitterController.find(twitterName.toString(), oldest)))
      const result = [
        ...twitter,
        ...resultYt.data]

      // const result: Array<reusltItem> = [...youtubeParsed,
      //   ...twitterParsed]

      result.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // @ts-ignore
      return res.status(200).send({
        result,
        oldest
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
