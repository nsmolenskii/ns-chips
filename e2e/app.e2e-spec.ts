import { NsMdExtentionsPage } from './app.po';

describe('ns-md-extentions App', () => {
  let page: NsMdExtentionsPage;

  beforeEach(() => {
    page = new NsMdExtentionsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
