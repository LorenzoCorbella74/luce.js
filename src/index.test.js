import Luce from './'

test('should get the pkg and create an istance', () => {
  // Act
  const istance = new Luce()
  // Assert
  expect(istance).toBeDefined()
})
