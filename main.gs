function doGet({ parameter: { testId, studentId } }) {
  if (!testId) {
    return HtmlService.createTemplateFromFile('error').evaluate();
  }

  if (!studentId) {
    const template = HtmlService.createTemplateFromFile('index');
    template.testId = testId;
    return template.evaluate();
  }

  const randomSort = a => a
    .map(v => [Math.random(), v])
    .sort(([k1], [k2]) => k1 - k2)
    .map(([, v]) => v);

  const sheets = SpreadsheetApp.openById(testId).getSheets();

  let newForm;

  for (const sheet of sheets) {
    const title = sheet.getRange('A1').getValue();

    if (!newForm) {
      newForm = FormApp.create(`${title} (${studentId})`)
        .setIsQuiz(true)
        .setShowLinkToRespondAgain(false)
    } else if (title) {
      newForm.addPageBreakItem().setTitle(title);
    };

    const numQuestions = parseInt(sheet.getRange('B1').getValue());

    const questions = sheet.getDataRange().getValues().slice(1);

    const shuffled = randomSort(questions)
      .slice(0, numQuestions);

    shuffled.forEach(([questionText, option1, option2, option3, option4]) => {
      const item = newForm.addMultipleChoiceItem();

      const shuffledChoices = randomSort([
        item.createChoice(option1, true),
        item.createChoice(option2),
        item.createChoice(option3),
        item.createChoice(option4),
      ]);

      item
        .setTitle(questionText)
        .setChoices(shuffledChoices)
        .setRequired(true)
        .setPoints(2);
    });
  }

  const formUrl = newForm.getPublishedUrl();

  return HtmlService.createHtmlOutput(`<script>window.location.href = "${formUrl}";</script>`)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
