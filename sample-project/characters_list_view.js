blitz.mvc.view('characters', 'frmCharactersList', {
  init: function() {
    fakeButton.onClick = function() {
      this.openForm('frmCharacterDetail', character);
    }.bind(this);
  }
});
