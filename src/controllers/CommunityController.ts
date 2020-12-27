// import Reddit from 'reddit'
import fetch from 'node-fetch'
import { Request, Response } from 'express'
import { youtube } from 'googleapis/build/src/apis/youtube'

import reusltItem, { resultItemType } from '@models/ResultItem'

export default new class CommunityController {
  public async reddit (req: Request, res: Response) {
    try {
      // const reddit = new Reddit({
      //   username: process.env.REDDIT_USERNAME,
      //   password: process.env.REDDIT_PASSWORD,
      //   appId: process.env.REDDIT_APIID,
      //   appSecret: process.env.REDDIT_SECRET
      //   // userAgent: 'MyApp/1.0.0 (http://example.com)'
      // })

      // const teste = await reddit.get('/r/Hololive/search', {
      //   sort: 'hot',
      //   q: 'a'
      // })
      var teste = await fetch('https://www.reddit.com/r/Hololive/hot.json?raw_json=1', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => res.json())

      console.log(teste.data.children.length)

      return res.status(200).send(teste.data)
    } catch (error) {
      console.log('error', error)
      return res.status(500).send({ error: JSON.stringify(error) })
    }
  }

  public async find (req: Request, res: Response) {
    try {
      // const { pageToken } = req.query

      const channelsIds = [
        'UCy_6UtZR5kKTTEdkMm2WzvQ', // Kiara
        'UCja0mlaE21eRx_Ih3QxU5yQ', // Kiara
        'UCHt7_vg0S5-wCIhvTWPt8Dw' // Kiara
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

          result.push({
            id: element.snippet.resourceId.videoId,
            type: resultItemType.Youtube,
            date: element.snippet.publishedAt,
            title: element.snippet.title,
            image: {
              medium: element.snippet.thumbnails.medium.url,
              higth: element.snippet.thumbnails.high.url
            }
          })
        }

        // result = [...result, ...resultTemp.data.items]
      })

      await Promise.all(promises)

      // Reddit
      var teste = await fetch('https://www.reddit.com/r/Hololive/hot.json?raw_json=1', {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => res.json())

      // result = [...result, ...teste.data.children]
      result.sort((a: reusltItem, b: reusltItem) => new Date(b.date).getTime() - new Date(a.date).getTime())

      let childId = 0
      if (result.length > teste.data.children.length) {}
      for (let index = 0; index < result.length; index++) {
        if (index % 5 === 0) {
          const element = teste.data.children[childId].data
          // console.log('childId', childId)
          // console.log('teste.data.children.length', )
          console.log('element', element)
          result.splice(index, 0, {
            type: resultItemType.Reddit,
            title: element.title,
            id: element.id,
            date: element.created_utc ? new Date(element.created_utc * 1000).toISOString() : null,
            image: {
              higth: element.url,
              // Can have multiple            \/
              medium: element.preview?.images[0].resolutions[2].url
            }
            // teste.data.children[childId]
          })

          childId++
          if (childId === teste.data.children.length) break
        }
      }

      return res.status(200).send(result)
    } catch (error) {
      console.log('error', error)
      return res.status(500).send({ error: JSON.stringify(error) })
    }
  }
}()
