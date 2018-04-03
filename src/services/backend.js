import axios from 'axios'

// TODO: this should be moved to config
const mflBackend = 'http://localhost:5000'
const karpBackend = 'https://ws.spraakbanken.gu.se/ws/karp/v4/'

const instance = axios.create({
  baseURL: mflBackend
})

const karpInstance = axios.create({
  baseURL: karpBackend
})

const helper = function (promise, callback) {
    return promise
      .then(function (response) {
        if(callback) {
          return callback(response.data)
        } else{
          return response.data
        }
      })
      .catch(function (error) {
        console.log(error)
      })
}

export default {
  login (user, password) {
    return new Promise(function (resolve, reject) {
      resolve({token: "abc", email: "hej@hej.se"})
    })
  },
  autocomplete (lexicon, word) {
    const params = {
      params: {
        q: word,
        resource: 'saldom', // TODO should be "lexicon"
        mode: 'external'
      }
    }
    return helper(karpInstance.get('/autocomplete', params), (data) => {
      return _.map(data.hits.hits, (elem) => elem._source.FormRepresentations[0].lemgram)
    })
  },
  getLexicons () {
    return helper(instance.get('/lexicon'), (data) => data.lexicons)
  },
  getLexicon (lexicon) {
    return helper(instance.get('/lexicon/' + lexicon))
  },
  getPosTags () {
    return helper(instance.get('/pos'), (data) => data.pos)
  },
  inflect (lexicon, wordForms, pos) {
    console.log("inflect", wordForms, pos)
    const params = {
      params: {
        table: wordForms.join(','),
        pos: pos,
        lexicon: lexicon
      }
    }
    return helper(instance.get('/inflect', params))
  },
  inflectLike (lexicon, word, like) {
    console.log("inflectClass", word, like)
    const params = {
      params: {
        word: word,
        like: like,
        lexicon: lexicon
      }
    }
    return helper(instance.get('/inflectlike', params))
  },
  inflectClass(lexicon, word, category, value, pos) {
    console.log("inflectClass", word, category, value, pos)
    const params = {
      params: {
        word: word,
        class: category,
        lexicon: lexicon,
        pos: pos
      }
    }
    params[category] = value
    return helper(instance.get('/inflectlike', params))
  },
  inflectTable(lexicon, tableRows, pos) {
    console.log("inflectTable", tableRows, pos)
    const params = {
      params: {
        table: _.map(tableRows, function(row) { return row.msd + '|' + row.value }).join(','),
        lexicon: lexicon,
        pos: pos
      }
    }
    return helper(instance.get('/inflectlike', params))
  },
  compileParadigm: async function () {
    const data = await this.compile('paradigm')
    return _.map(data.stats, function(stat) {
      return stat.join(" ")
    })
  },
  compileWordForm: async function () {
    const data = await this.compile('wf')
    return _.map(data.hits.hits, function(hit) {
      return _.values(hit._source.FormRepresentations[0]).join(" ")
    })
  },
  compileClass: async function (className) {
    const data = await this.compile('class', className)
    return _.map(data.stats, function(stat) {
      return stat.join(" ")
    })
  },
  compile (compileType, className) {
    if (!_.includes(["wf", "paradigm", "class"], compileType)) {
      throw Error()
    }
    const params = {
      s: compileType
    }
    if(compileType == "class") {
      params["classname"] = className
    }
    return helper(instance.get('/compile', {params: params}))
  }
}