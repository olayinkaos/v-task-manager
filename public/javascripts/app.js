$(document).ready(function() {
  $('.modal-trigger').click(function(e) {
    e.preventDefault();
    let target = $(this).data('target');
    $(`#${target}`).addClass('is-active');
  })

  $('.modal .remove').click(function(e) {
    $(this).closest('.modal').removeClass('is-active');
  });

  $('.notification .delete').click(function (e) {
    $(this).closest('.notification').hide();
  })

  $('[data-confirm]').click(function(e) {
    text = $(this).data('confirm');
    return confirm(text);
  })

  $('.add-subtask').click(function(e) {
    $(this).addClass('is-hidden');
    $('.add-subtask-form').removeClass('is-hidden');
    $('.remove-add-subtask').removeClass('is-hidden');
    $('.subtask-table').addClass('is-hidden');
    $('.edit-subtask-form').addClass('is-hidden');
  })
  $('.remove-add-subtask').click(function(e) {
    $(this).addClass('is-hidden');
    $('.add-subtask-form').addClass('is-hidden');
    $('.add-subtask').removeClass('is-hidden');
    $('.subtask-table').removeClass('is-hidden');
    $('.edit-subtask-form').addClass('is-hidden');
  })
  $('.edit-subtask-btn').click(function(e) {
    e.preventDefault();
    let form = '.edit-subtask-form', 
        self = $(this);
    $(`${form} [name=subtask_id]`).val(self.data('id'));
    $(`${form} [name=content]`).val(self.data('content'));
    $(`${form} [name=priority][value=${self.data('priority')}]`).prop('checked', true);
    $(`${form} [name=dueDate]`).val(self.data('duedate'));

    $(form).removeClass('is-hidden');
    $('.remove-add-subtask').removeClass('is-hidden');
    $('.add-subtask-form').addClass('is-hidden');
    $('.add-subtask').removeClass('is-hidden');
    $('.subtask-table').addClass('is-hidden');
  })
})