const { client, setup, teardown } = require('./test_helper.js')
const { uuidv4, UUID_RE } = require('../util.js')

const Doc = require('./doc.js')

async function setHistDoc(date, attrs) {
  let doc = await Doc.setDoc(attrs)
  return await Doc.setUpdatedAt({
    docId: doc.docId,
    updatedAt: date,
  })
}

describe('Doc model tests', () => {
  beforeAll(setup)
  afterAll(teardown)

  it('getDoc', async () => {
    const docId = uuidv4()
    const relmId = uuidv4()
    await Doc.setDoc({ docId, relmId })

    const doc = await Doc.getDoc({ docId })
    expect(doc).toEqual({
      docId,
      docType: 'permanent',
      relmId,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })

  it('setDoc creates a doc with UUID', async () => {
    const docId = uuidv4()
    const relmId = uuidv4()
    const doc = await Doc.setDoc({ docId, relmId })
    expect(doc).toEqual({
      docId,
      docType: 'permanent',
      relmId,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })

  it('setDoc creates a doc with default UUID', async () => {
    const relmId = uuidv4()
    const doc = await Doc.setDoc({ relmId })
    expect(doc).toEqual({
      docId: expect.stringMatching(UUID_RE),
      docType: 'permanent',
      relmId,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })

  it('setDoc updates the doc timestamp', async () => {
    const relmId = uuidv4()
    let doc = await Doc.setDoc({ relmId })
    await Doc.setUpdatedAt({
      docId: doc.docId,
      updatedAt: new Date('2010-01-01T00:00:00'),
    })
    doc = await Doc.setDoc({ relmId })
    expect(doc.updatedAt.getFullYear()).toBeGreaterThan(2010)
  })

  it('setUpdatedAt', async () => {
    const relmId = uuidv4()
    const pastDate = new Date('2010-01-01')
    const doc = await setHistDoc(pastDate, { relmId })
    expect(doc).toEqual({
      docId: expect.stringMatching(UUID_RE),
      docType: 'permanent',
      relmId,
      createdAt: expect.any(Date),
      updatedAt: pastDate,
    })
  })

  it('getLatestDocs', async () => {
    const relmId = uuidv4()
    const date1 = new Date('2010-12-31')
    const date2 = new Date('2020-12-31')
    const t1 = await setHistDoc(date1, { relmId, docType: 'transient' })
    const t2 = await setHistDoc(date2, { relmId, docType: 'transient' })
    const p1 = await setHistDoc(date1, { relmId, docType: 'permanent' })
    const p2 = await setHistDoc(date2, { relmId, docType: 'permanent' })

    const docs = await Doc.getLatestDocs({ relmId })
    expect(Object.keys(docs).length).toEqual(2)
    expect(docs.transient.updatedAt).toEqual(date2)
    expect(docs.permanent.updatedAt).toEqual(date2)
  })
})
