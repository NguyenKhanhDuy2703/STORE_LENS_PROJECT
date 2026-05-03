const ExcelJS = require('exceljs');
const moment = require('moment-timezone');
const Customer = require('../schemas/customer.schema');
const CustomerCareRule = require('../schemas/customerCareRule.schema');

const TIMEZONE = 'Asia/Ho_Chi_Minh';

const exportComprehensiveReportService = async (locationId) => {
    // 1. LẤY DỮ LIỆU GỐC
    const customers = await Customer.find({ locationId }).lean();
    const activeRules = await CustomerCareRule.find({ location_id: locationId, is_active: true }).lean();

    const workbook = new ExcelJS.Workbook();

    // --- ĐỊNH NGHĨA STYLE CHUẨN ---
    const font13 = { name: 'Times New Roman', size: 13 };
    const font13Bold = { name: 'Times New Roman', size: 13, bold: true };
    const borderStyle = { 
        top: { style: 'thin' }, left: { style: 'thin' }, 
        bottom: { style: 'thin' }, right: { style: 'thin' } 
    };
    const centerAlign = { vertical: 'middle', horizontal: 'center', wrapText: true };

    // ============================================================
    // SHEET 1: TẦN SUẤT TẬP LUYỆN (THEO NĂM - CHỐNG LẶP CHECKIN)
    // ============================================================
    const sheet1 = workbook.addWorksheet('1. Tần Suất Tập Luyện');
    sheet1.views = [{ state: 'frozen', xSplit: 2, ySplit: 3 }];

    const startOfYear = moment().tz(TIMEZONE).startOf('year');
    const effectiveEnd = moment().tz(TIMEZONE).endOf('month');
    const monthsInRange = [];
    let tempDate = startOfYear.clone();
    while (tempDate.isSameOrBefore(effectiveEnd, 'month')) {
        monthsInRange.push({ month: tempDate.month() + 1, year: tempDate.year(), label: `THÁNG ${tempDate.format('MM')}` });
        tempDate.add(1, 'month');
    }

    sheet1.getColumn(1).width = 6;
    sheet1.getColumn(2).width = 35; // Họ tên rộng để không bị vỡ

    let currentCol = 3;
    const footerTotals = {};

    // Header Sheet 1
    monthsInRange.forEach(m => {
        footerTotals[m.month] = { w1: { abs: 0, pres: 0, check: 0 }, w2: { abs: 0, pres: 0, check: 0 }, w3: { abs: 0, pres: 0, check: 0 }, w4: { abs: 0, pres: 0, check: 0 } };
        const startCol = currentCol;
        for (let w = 1; w <= 4; w++) {
            sheet1.getCell(2, currentCol).value = `T.${w}`;
            let dStart = (w - 1) * 7 + 1;
            let dEnd = w === 4 ? moment(`${m.year}-${m.month}`, "YYYY-MM").endOf('month').date() : w * 7;
            sheet1.getCell(3, currentCol).value = `(${dStart}/${m.month < 10 ? '0'+m.month : m.month}-${dEnd}/${m.month < 10 ? '0'+m.month : m.month})`;
            sheet1.getColumn(currentCol).width = 14;
            [2, 3].forEach(r => { 
                const c = sheet1.getCell(r, currentCol); 
                c.font = font13Bold; c.alignment = centerAlign; c.border = borderStyle; 
            });
            currentCol++;
        }
        sheet1.mergeCells(1, startCol, 1, currentCol - 1);
        const mCell = sheet1.getCell(1, startCol);
        mCell.value = m.label; mCell.font = font13Bold; mCell.alignment = centerAlign; mCell.border = borderStyle;
        mCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    });

    // Cột extra cuối Sheet 1
    const extraHeaders1 = ['LÍ DO KH NGHỈ', 'TRẠNG THÁI'];
    extraHeaders1.forEach((text, idx) => {
        sheet1.mergeCells(1, currentCol, 3, currentCol);
        const cell = sheet1.getCell(1, currentCol);
        cell.value = text; cell.font = font13Bold; cell.alignment = centerAlign; cell.border = borderStyle;
        sheet1.getColumn(currentCol).width = idx === 0 ? 25 : 15;
        currentCol++;
    });

    // Đổ dữ liệu Sheet 1
    customers.forEach((member, index) => {
        const rowIndex = index + 4;
        sheet1.getRow(rowIndex).height = 25;
        sheet1.getCell(rowIndex, 1).value = index + 1;
        sheet1.getCell(rowIndex, 2).value = member.name.toUpperCase();
        [1, 2].forEach(c => { sheet1.getCell(rowIndex, c).font = font13; sheet1.getCell(rowIndex, c).border = borderStyle; });
        sheet1.getCell(rowIndex, 2).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

        let colPtr = 3;
        monthsInRange.forEach(m => {
            // !!! CHỐNG LẶP CHECKIN: Chỉ lấy các ngày duy nhất !!!
            const uniqueDates = [...new Set(member.history
                .filter(h => moment(h.date).month() + 1 === m.month && moment(h.date).year() === m.year)
                .map(h => moment(h.date).tz(TIMEZONE).format('YYYY-MM-DD'))
            )];

            const wCount = { w1: 0, w2: 0, w3: 0, w4: 0 };
            uniqueDates.forEach(dStr => {
                const d = parseInt(dStr.split('-')[2]);
                if (d <= 7) wCount.w1++; else if (d <= 14) wCount.w2++; else if (d <= 21) wCount.w3++; else wCount.w4++;
            });

            ['w1', 'w2', 'w3', 'w4'].forEach(w => {
                const cell = sheet1.getCell(rowIndex, colPtr);
                const count = wCount[w];
                cell.font = font13; cell.alignment = centerAlign; cell.border = borderStyle;
                if (count === 7) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                else if (count > 0) cell.value = count;
                
                if (count > 0) { footerTotals[m.month][w].pres++; footerTotals[m.month][w].check += count; }
                else { footerTotals[m.month][w].abs++; }
                colPtr++;
            });
        });

        const sttCell = sheet1.getCell(rowIndex, currentCol - 1);
        sttCell.value = member.status === 'ACTIVE' ? 'ON' : 'BẬN';
        sttCell.font = font13Bold; sttCell.alignment = centerAlign; sttCell.border = borderStyle;
        sttCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: member.status === 'ACTIVE' ? 'FFC6EFCE' : 'FFFFC7CE' } };
    });

    // Dòng tổng kết Cyan
    const footRows = [{ l: 'VẮNG TẬP', k: 'abs', p: '-' }, { l: 'KH ĐI TẬP', k: 'pres', p: '' }, { l: 'LƯỢT CHECKIN', k: 'check', p: '' }];
    footRows.forEach((cfg, i) => {
        const rIdx = customers.length + 5 + i;
        const lbl = sheet1.getCell(rIdx, 2);
        lbl.value = cfg.l; lbl.font = font13Bold; lbl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FFFF' } };
        lbl.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 }; lbl.border = borderStyle;

        let colPtr = 3;
        monthsInRange.forEach(m => {
            ['w1', 'w2', 'w3', 'w4'].forEach(w => {
                const cell = sheet1.getCell(rIdx, colPtr);
                cell.value = cfg.p === '-' ? -footerTotals[m.month][w][cfg.k] : footerTotals[m.month][w][cfg.k];
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FFFF' } };
                cell.font = font13Bold; cell.border = borderStyle; cell.alignment = centerAlign;
                colPtr++;
            });
        });
    });

    // ============================================================
    // SHEET 2: KẾ HOẠCH CHĂM SÓC (30 NGÀY - CHỐNG LẶP CHECKIN)
    // ============================================================
    const sheet2 = workbook.addWorksheet('2. Kế Hoạch Chăm Sóc');
    
    // Header Viền Xanh Dương
    sheet2.mergeCells('A1:G3');
    const header2 = sheet2.getCell('A1');
    header2.value = "KẾ HOẠCH CHĂM SÓC & PHÂN LOẠI KHÁCH HÀNG\n(Dữ liệu tính toán dựa trên số ngày tập thực tế duy nhất trong 30 ngày qua)";
    header2.font = { ...font13Bold, size: 15 };
    header2.alignment = centerAlign;
    header2.border = { 
        top: {style:'medium', color:{argb:'FF0000FF'}}, left: {style:'medium', color:{argb:'FF0000FF'}}, 
        bottom: {style:'medium', color:{argb:'FF0000FF'}}, right: {style:'medium', color:{argb:'FF0000FF'}} 
    };

    // Header Cột
    const h2Cols = ['STT', 'MÃ KH', 'HỌ VÀ TÊN', 'TRẠNG THÁI', 'SỐ BUỔI (30 NGÀY)', 'PHÂN LOẠI', 'ĐỀ XUẤT HÀNH ĐỘNG'];
    const r4Care = sheet2.getRow(4);
    r4Care.values = h2Cols; r4Care.height = 30;
    const w2 = [8, 15, 35, 15, 20, 30, 55];
    h2Cols.forEach((text, i) => {
        sheet2.getColumn(i + 1).width = w2[i];
        const cell = r4Care.getCell(i + 1);
        cell.font = font13Bold; cell.border = borderStyle; cell.alignment = centerAlign;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    });

    const thirtyDaysAgo = moment().tz(TIMEZONE).subtract(30, 'days').toDate();
    
    customers.forEach((member, index) => {
        const rowIndex = index + 5;
        // !!! CHỐNG LẶP CHECKIN 30 NGÀY !!!
        const sessions30 = [...new Set(member.history
            .filter(h => new Date(h.date) >= thirtyDaysAgo)
            .map(h => moment(h.date).tz(TIMEZONE).format('YYYY-MM-DD'))
        )].length;

        let rule = activeRules.find(r => sessions30 <= r.logic.threshold);
        let statusText = member.status === 'ACTIVE' ? 'ON' : 'BẬN';
        let classification = member.status === 'ACTIVE' ? (rule ? rule.rule_name : "Tập luyện tốt") : "Đang tạm nghỉ";
        let action = member.status === 'ACTIVE' ? (rule ? rule.action : "Duy trì chăm sóc") : "Liên hệ hỏi thăm lý do nghỉ";

        const row = sheet2.getRow(rowIndex);
        row.values = [index + 1, member.code, member.name.toUpperCase(), statusText, sessions30 + " buổi", classification, action];
        row.height = 28;

        row.eachCell((cell, colNum) => {
            cell.font = font13; cell.border = borderStyle;
            cell.alignment = { 
                vertical: 'middle', 
                horizontal: (colNum === 3 || colNum === 7) ? 'left' : 'center', 
                indent: 1, wrapText: true 
            };
            
            // Màu sắc theo trạng thái
            if (member.status === 'ACTIVE' && rule) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }; // Vàng (Cảnh báo)
            if (member.status === 'INACTIVE') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE6E6' } }; // Hồng nhạt (Inactive)
        });
    });

    return workbook;
};

module.exports = { exportComprehensiveReportService };