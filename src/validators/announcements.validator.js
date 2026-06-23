import { celebrate, Joi, Segments } from "celebrate";

export const getAnnouncementsValidator = celebrate({
  [Segments.QUERY]: Joi.object({
    search: Joi.string().optional().allow(""),
    sort: Joi.string().optional().valid("newest", "oldest"),
    page: Joi.number().optional().positive().default(1),
  }),
});

export const getAnnouncementByIdValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
});

export const createAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().required().min(5).max(100),
    description: Joi.string().required().min(10),
    price: Joi.number().required().positive(),
    category: Joi.string().required().valid("sale", "service", "job", "other"),
    contactInfo: Joi.string().required().min(5),
  }),
});

export const updateAnnouncementValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
  [Segments.BODY]: Joi.object({
    title: Joi.string().optional().min(5).max(100),
    description: Joi.string().optional().min(10),
    price: Joi.number().optional().positive(),
    category: Joi.string().optional().valid("sale", "service", "job", "other"),
    contactInfo: Joi.string().optional().min(5),
  }).min(1), // At least one field must be present
});

export const deleteAnnouncementValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().required(),
  }).unknown(true),
});
