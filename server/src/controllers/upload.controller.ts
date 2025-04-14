import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// Import multer's types
import { Multer } from 'multer';

// Define correctly typed interface for multer request
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Make sure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadController = {
  /**
   * Upload a file
   * @param req Request object
   * @param res Response object
   */
  uploadFile: (req: RequestWithFile, res: Response) => {
    try {
      // The file should be available in req.file due to multer middleware
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Get the type of upload from the request body
      const type = req.body.type || 'general';
      
      // Create a URL for the uploaded file
      const fileUrl = `/api/upload/${req.file.filename}`;
      
      // Return the file URL and success status
      return res.status(200).json({
        url: fileUrl,
        filename: req.file.filename,
        success: true
      });
    } catch (error) {
      console.error('File upload error:', error);
      return res.status(500).json({ message: 'Error uploading file', success: false });
    }
  },

  /**
   * Get an uploaded file
   * @param req Request object
   * @param res Response object
   */
  getFile: (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      
      // Make sure the filename exists
      if (!filename) {
        return res.status(400).json({ message: 'Filename is required' });
      }
      
      // Build the file path
      const filePath = path.join(uploadsDir, filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Send the file
      return res.sendFile(filePath);
    } catch (error) {
      console.error('File retrieval error:', error);
      return res.status(500).json({ message: 'Error retrieving file' });
    }
  }
}; 