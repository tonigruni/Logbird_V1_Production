import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportInsightsPdf(): Promise<void> {
  const el = document.getElementById('insights-content')
  if (!el) throw new Error('Insights content element not found')

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#eeedeb',
  })

  const imgWidth = 210 // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const pdf = new jsPDF('p', 'mm', 'a4')

  // If content is taller than one page, paginate
  const pageHeight = 297 // A4 height in mm
  let position = 0

  if (imgHeight <= pageHeight) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
  } else {
    while (position < imgHeight) {
      const sourceY = (position / imgHeight) * canvas.height
      const sliceHeight = Math.min(pageHeight, imgHeight - position)
      const sourceSliceHeight = (sliceHeight / imgHeight) * canvas.height

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceSliceHeight
      const ctx = pageCanvas.getContext('2d')!
      ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceSliceHeight, 0, 0, canvas.width, sourceSliceHeight)

      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, sliceHeight)
      position += pageHeight
      if (position < imgHeight) pdf.addPage()
    }
  }

  pdf.save(`journal-insights-${new Date().toISOString().slice(0, 10)}.pdf`)
}
