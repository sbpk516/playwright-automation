import {test, expect} from '@playwright/test';


test('SAN-04 Subscriber add and removes watchlist', async({page,request}) => {

   await request.post('/api/v1/test/reset');
   await page.goto('sign-in');
   await page.getByLabel('Email').fill('river@streamforge.test');
   await page.getByLabel('Password').fill('stream123');
   await page.getByRole('button',{name:'Sign in'}).click();

   await expect(page).toHaveURL('/browse');
   await page.goto('/title/title-01');

   await expect(
    page.getByRole('heading',{name:'Afterlight', level:1})).toBeVisible();
   const addButton = page.getByRole('button',{name:/Add to my list/i});
   await expect(addButton).toBeVisible();
   await addButton.click();
   
   await expect(page.getByRole('link', {name:'My list'})).toBeVisible();
   await page.getByRole('link', {name:'My list'}).click();
//    await page.waitForTimeout(3000)
   await expect(page).toHaveURL(/\/watchlist$/)
   await expect(page.getByRole('link', {name:'View Afterlight'})).toBeVisible();

   // Verify Afterlight is present in the watchlist
const afterlightRow = page.getByRole('link', { name: 'View Afterlight' });
await expect(afterlightRow).toBeVisible();

// Remove Afterlight from the watchlist
const removeButton = page.getByRole('button', { name: 'Remove Afterlight' });
await removeButton.click();

// Verify Afterlight is no longer in the watchlist
await expect(page.getByRole('link', { name: 'View Afterlight' })).toHaveCount(0);
await expect(page.getByRole('button', { name: 'Remove Afterlight' })).toHaveCount(0);

})