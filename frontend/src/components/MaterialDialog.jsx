
import { useEffect, useState } from "react";
import {
    Alert, Button, Dialog, DialogActions,
    DialogContent, DialogTitle, MenuItem, Select, InputLabel, FormControl, TextField,
} from "@mui/material";

import api from "../api/axiosConfig";

const emptyForm = {
    MATERIAL_ID: "",
    MATERIAL_NAME: "",
    MATERIAL_DESCRIPTION: "",
    MATERIAL_MEASURE: "",
    PRICE_PRICE: ""
};

const measures = [{
    MATERIAL_MEASURE: "kg",
    MATERIAL_MEASURE_LABEL: "Килограм(кг)",
}, {

    MATERIAL_MEASURE: "m",
    MATERIAL_MEASURE_LABEL: "Метър(м.)",

}, {MATERIAL_MEASURE: "бр.",
    MATERIAL_MEASURE_LABEL: "Брой(бр.)",

}, {MATERIAL_MEASURE: "m^2",
    MATERIAL_MEASURE_LABEL: "Квадратен метър(m^2)",

    }, {MATERIAL_MEASURE: "l",
    MATERIAL_MEASURE_LABEL: "Литър(l)",
}];

export default function MaterialDialog({
    open, material, onClose, onSaved
}) {
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const isEdit = Boolean(material);

    // Зареждаме данните при отваряне
    useEffect(() => {
        setForm(material ? {
            MATERIAL_ID: String(material.MATERIAL_ID),
            MATERIAL_NAME: material.MATERIAL_NAME || "",
            MATERIAL_DESCRIPTION: material.MATERIAL_DESCRIPTION || "",
            MATERIAL_MEASURE: material.MATERIAL_MEASURE || "",
            PRICE_PRICE: ""
        } : emptyForm);

        setError("");
    }, [material, open]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.MATERIAL_NAME.trim()) {
            setError("Наименованието е задължително.");
            return;
        }

        if (!isEdit) {
            const id = Number(form.MATERIAL_ID);
            const price = Number(form.PRICE_PRICE);

            if (!Number.isSafeInteger(id) || id <= 0) {
                setError("Въведи валиден код.");
                return;
            }

            if (form.PRICE_PRICE === "" || !Number.isFinite(price) || price < 0) {
                setError("Въведи валидна начална цена.");
                return;
            }
        }

        const data = {
            MATERIAL_NAME: form.MATERIAL_NAME.trim(),
            MATERIAL_DESCRIPTION: form.MATERIAL_DESCRIPTION.trim() || null,
            MATERIAL_MEASURE: form.MATERIAL_MEASURE.trim() || null
        };

        try {
            setSaving(true);

            if (isEdit) {
                await api.put(`/materials/${material.MATERIAL_ID}`, data);
            } else {
                await api.post("/materials", {
                    ...data,
                    MATERIAL_ID: Number(form.MATERIAL_ID),
                    PRICE_PRICE: Number(form.PRICE_PRICE)
                });
            }

            onClose();
            onSaved();
        } catch (err) {
            setError(err.response?.data?.error || "Грешка при запис.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {isEdit ? "Редактиране на материал" : "Нов материал"}
                </DialogTitle>

                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Код"
                        name="MATERIAL_ID"
                        type="number"
                        value={form.MATERIAL_ID}
                        onChange={handleChange}
                        disabled={isEdit}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Наименование"
                        name="MATERIAL_NAME"
                        value={form.MATERIAL_NAME}
                        onChange={handleChange}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Характеристики"
                        name="MATERIAL_DESCRIPTION"
                        multiline
                        rows={3}
                        value={form.MATERIAL_DESCRIPTION}
                        onChange={handleChange}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="material-measure-select-label">Мерна единица</InputLabel>
                        <Select
                            labelId="material-measure-select-label"
                            id="material-measure-select"
                            value={form.MATERIAL_MEASURE}
                            name="MATERIAL_MEASURE"
                            label="Мерна единица"
                            onChange={handleChange}
                        >
                            {measures.map((measure) => <MenuItem value={measure.MATERIAL_MEASURE}>{measure.MATERIAL_MEASURE_LABEL}</MenuItem>)}
                        </Select>
                    </FormControl>

                    {!isEdit && (
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Начална цена"
                            name="PRICE_PRICE"
                            type="number"
                            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                            value={form.PRICE_PRICE}
                            onChange={handleChange}
                            required
                        />
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={saving}>Отказ</Button>
                    <Button type="submit" variant="contained" disabled={saving}>
                        {saving ? "Записване..." : "Запази"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
