const Relm = require('./relm.js')

const { setup, teardown } = require('./test_helper.js')
const { uuidv4, UUID_RE } = require('../util.js')

describe('Relm model tests', () => {
  beforeAll(setup)
  afterAll(teardown)

  it('Gets all public relms', async () => {
    await Relm.createRelm({ relmName: 'allpub-public-relm-1', isPublic: true })
    await Relm.createRelm({ relmName: 'allpub-public-relm-2', isPublic: true })
    await Relm.createRelm({
      relmName: 'allpub-private-relm-3',
      isPublic: false,
    })
    const relms = await Relm.getAllRelms({
      prefix: 'allpub',
      isPublic: true,
    })
    const relmNames = new Set(relms.map((r) => r.relmName))
    expect(relmNames).toEqual(
      new Set(['allpub-public-relm-1', 'allpub-public-relm-2'])
    )
  }),
    it('Creates a relm with defaults', async () => {
      const relmName = 'relm-being-created'
      const relm = await Relm.createRelm({ relmName })
      expect(relm).toEqual({
        relmId: expect.stringMatching(UUID_RE),
        relmName: 'relm-being-created',
        isPublic: false,
        defaultEntrywayId: null,
        createdBy: null,
        createdAt: expect.any(Date),
        transientDocId: expect.stringMatching(UUID_RE),
        permanentDocId: expect.stringMatching(UUID_RE),
      })
    })

  it('Gets a relm by relmName', async () => {
    const relmName = 'relm-with-name'
    await Relm.createRelm({ relmName })
    const relm = await Relm.getRelm({ relmName })
    expect(relm.relmName).toEqual(relmName)
    expect(relm.transientDocId).toBeDefined()
    expect(relm.permanentDocId).toBeDefined()
  })

  it('Gets a relm by relmId', async () => {
    const relmId = uuidv4()
    const relmName = 'relm-with-id'
    await Relm.createRelm({ relmId, relmName })
    const relm = await Relm.getRelm({ relmId })
    expect(relm.relmName).toEqual(relmName)
  })

  it('Updates a relm', async () => {
    const relmName = 'relm-being-updated'
    const createdRelm = await Relm.createRelm({ relmName })

    const relm = await Relm.updateRelm({
      relmId: createdRelm.relmId,
      relmName: 'relm-has-been-updated',
      isPublic: true,
    })

    expect(relm.isPublic).toBe(true)
    expect(relm.relmName).toEqual('relm-has-been-updated')
  })
})
