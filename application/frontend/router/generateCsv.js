import ExcelJS from 'exceljs';
import { Router } from 'express';
import path from 'node:path'
import fs from 'node:fs'

const generateCsvRouter = Router();
generateCsvRouter.get('/generate-csv', async (req, res) => {
  const budgetId = req.query.budget;
  const enterpriseDocument = req.query.enterpriseDocument;
  const enterpriseName = req.query.enterpriseName;
  const authorization = req.CM.getCookie('authorization');
  try {
    const modelPath = path.resolve('frontend', 'static', 'model.xlsx')
    const workbook = await new ExcelJS.Workbook().xlsx.readFile(modelPath);
    const worksheet = workbook.getWorksheet('Orçamento')
    const request = await fetch(`${process.env.API_URL}/budget/${budgetId}?populated=1`, {
      headers: { authorization }
    })
    const budget = await request.json()

    worksheet.getCell('A2').value = `Número: ${budget?.code}`
    worksheet.getCell('A4').value = `Obra: ${budget.workName}`
    worksheet.getCell('F3').value = `Orçamento: ${budget.name}`
    worksheet.getCell('J2').value = `BDI: ${budget.bdi},000%`
    worksheet.getCell('J4').value = `${enterpriseDocument} ${enterpriseName}`

    const result = [budget.supplies, budget.compositions].flat().reduce((result, obj, index) => {
      if ('children' in obj.source) {
        result.push([
          [index + 1, 'COMPOSICAO', obj.source.database, obj.source.code, obj.source.description],
          ...obj.source.children.map((child, innerIndex) => {
            const currentItem = obj.childPrices.find((item) => item.id == child._id);
            const calc = currentItem.price  * currentItem.quantity;
            const bdiResult = calc + (calc * budget.bdi / 100)
            return [
              `${index + 1}.${innerIndex + 1}`,
              child.type,
              "SINAPI",
              child.code,
              child.description,
              child.unit,
              currentItem.quantity,
              currentItem.price,
              bdiResult,
              calc,
              calc
            ]
          })
        ])
      } else {
        const calc = obj.price.toFixed(2)  * obj.quantity;
        const bdiResult = calc + (calc * budget.bdi / 100);
        result.push([[
          index + 1,
          "INSUMO",
          "SINAPI",
          obj.source.code,
          obj.source.description,
          obj.source.unit,
          obj.quantity,
          obj.price,
          bdiResult,
          calc,
          calc
        ]])
      }
      return result
    }, []).flat()

    worksheet.getCell('J6').value = "Total: "
    worksheet.getCell('K6').value = { formula: `SUM(K9:K${result.length + 9})` };
    worksheet
      .findRows(9, result.length)
      .forEach((row, index) => row.values = result[index])

    const buffer = await workbook.xlsx.writeBuffer({ filename: `test-spreadsheet-${Date.now()}.xlsx`, });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="test-spreadsheet-${Date.now()}.xlsx"`);
    res.end(buffer);
    setTimeout(() => {
      req.storage.budget.del(req.userId);
    }, 2000)
  } catch (err) {
    res.status(500).send('Erro ao gerar planilha.');
  }
});

export default generateCsvRouter;