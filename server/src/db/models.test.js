const { useToken, Invitation, Permission } = require('./models.js')

const { client, setup, teardown } = require('./test_helper.js')
const { uuidv4 } = require('../util.js')

describe('Models', () => {
  beforeAll(setup)
  afterAll(teardown)

  it('useToken for invitation', async () => {
    const token = uuidv4() // token can be anything, we just need something unique for testing
    const relmId = uuidv4()
    const playerId = uuidv4()
    const invitation = await Invitation.createInvitation({
      token,
      relmId,
      maxUses: 1,
      permits: [Permission.ACCESS],
    })
    expect(invitation.used).toEqual(0)

    const usedInvitation = await useToken({
      token,
      relmId,
      playerId,
    })
    expect(usedInvitation.used).toEqual(1)

    const permits = await Permission.getPermissions({
      relmId,
      playerId,
    })
    expect(permits).toEqual(new Set([Permission.ACCESS]))
  })
})
