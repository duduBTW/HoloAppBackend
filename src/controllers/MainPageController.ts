import { Request, Response } from 'express'
import { youtube } from 'googleapis/build/src/apis/youtube'

import reusltItem, { resultItemType } from '@models/ResultItem'

// interface videoResult {
//   thumb: string
//   title: string
//   date: string
// }

export default new class MainController {
  // TODO
  // SEE IF THE VIDEOS RETURNED BY THE PLAYLIST API ARE RIGHT
  public async find (req: Request, res: Response) {
    try {
      // const { pageToken } = req.query

      const channelsIds = [
        'UCHsx4Hqa-1ORjQTh9TYDhww', // Kiara
        'UCL_qhgtOy0dy1Agp8vkySQg', // Calli
        'UCoSrY_IQQVpmIRZ9Xf-y93g',
        'UCMwGHR0BTZuLsmjY_NT5Pwg',
        'UCyl1z3jo3XHR1riLFKG5UAg',
        'UChAnqc_AY5_I3Px5dig3X1Q'
      ]
      const result: Array<reusltItem> = []
      const tokenResult = {}

      const promises = channelsIds.map(async item => {
        const channelInfo = await youtube('v3').channels.list({
          id: [item.toString()],
          part: ['contentDetails'],
          key: process.env.YOUTUBE_TOKEN

        })
        const resultTemp = await youtube('v3').playlistItems.list({
          playlistId: channelInfo.data.items[0].contentDetails.relatedPlaylists.uploads,
          part: ['snippet'],
          key: process.env.YOUTUBE_TOKEN,
          maxResults: 10,
          pageToken: 'CAQQAA'
        })

        tokenResult[item] = resultTemp.data.nextPageToken

        for (let index = 0; index < resultTemp.data.items.length; index++) {
          const element = resultTemp.data.items[index]
          if (element.snippet) {
            result.push({
              id: element.snippet.resourceId.videoId,
              type: resultItemType.Youtube,
              date: element.snippet.publishedAt,
              title: element.snippet.title,
              image: element.snippet.thumbnails.medium.url
              // higth: element.snippet.thumbnails.high.url
              // }
            })
          }
        }
      })

      await Promise.all(promises)

      result.sort((a: reusltItem, b: reusltItem) => new Date(b.date).getTime() - new Date(a.date).getTime())
      // return res.status(200).send({ tokenResult, result })
      return res.status(200).send(result)
    } catch (error) {
      console.log('error', error)
      return res.status(500).send({ error: JSON.stringify(error) })
    }
  }
}()
