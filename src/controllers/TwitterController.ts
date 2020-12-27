import reusltItem, { resultItemType } from '@models/ResultItem'
// import Twit from 'twit'
import fetch from 'node-fetch'

export default new class TwitterController {
  public find = async (user: string, date: string) => {
    console.log(date)
    // var data = await this.T.get('statuses/home_timeline', {
    //   q: '-filter:retweets -filter:replies',
    //   count: 20,
    //   name: 'moricalliope',
    //   // user_id: 1283653858510598144,
    //   include_rts: false,
    //   exclude_replies: true
    // }).catch(err => console.log(err))

    // console.log(data)

    return await fetch(`https://api.twitter.com/2/users/1283653858510598144/tweets?start_time=${date.slice(0, -5)}Z&tweet.fields=text,id,created_at&media.fields=url,preview_image_url&expansions=attachments.media_keys&exclude=retweets,replies`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer ' + process.env.TWITTER_BEARER
        }
      }
    )
      .then(res => res.json())
  }

  public parseTwitterResponsev2 = (resultT) => {
    const { data, includes } = resultT
    console.log(includes)

    const result: Array<reusltItem> = []

    for (let index = 0; index < data.length; index++) {
      const element = data[index]
      console.log(element.attachments)
      result.push({
        id: element.id,
        type: resultItemType.Twitter,
        date: element.created_at,
        title: element.text,
        image: {
          medium: element.attachments && element.attachments.media_keys ? includes.media.find(item => element.attachments.media_keys[0] === item.media_key).preview_image_url : null
        }
      })
    }

    return result
  }

  public parseTwitterResponse = (resultItem) => {
    const result: Array<reusltItem> = []

    for (let index = 0; index < resultItem.statuses.length; index++) {
      const element = resultItem.statuses[index]
      result.push({
        id: element.id.toString(),
        type: resultItemType.Twitter,
        date: new Date(element.created_at).toISOString(),
        title: element.text
        // image: {
        // medium: element.snippet.thumbnails.medium.url,
        // higth: element.snippet.thumbnails.high.url
        // }
      })
    }

    return result
  }
}()
