import { Ticket } from '../ticket';

it('implements Optimistic Concurrency Control', async (done) => {
  // Create an instance of a ticket
  const ticket = Ticket.build({
    title: 'ticket',
    price: 200,
    userId: '123',
  });

  //Save the ticket to the DB
  await ticket.save();

  //Fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  //Make two separate changes to the tickets we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 20 });

  //Save de first fetched ticket
  await firstInstance!.save();

  //Save the second feched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (error) {
    return done();
  }
  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'ticket',
    price: 200,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
