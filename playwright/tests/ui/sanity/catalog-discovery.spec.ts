import {test, expect} from '@playwright/test';

test('SAN-03 Subscriber finds and open a title', async({page}) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('river@streamforge.test')
    await page.getByLabel('Password').fill('stream123');
    await page.getByRole('button',{name:'Sign in'}).click();
    await expect(page).toHaveURL('/browse');
    await page.getByRole('textbox',{name:'Search'}).fill('Afterlight');
    await expect(page.getByRole('link',{name:'View Afterlight'})).toBeVisible();
    const afterlifecarddetails = page.locator('article.poster-card').filter({has:page.getByRole('link',{name:'View AfterLight'})
    })
    await page.getByRole('link', {name:'View Afterlight'}).click();
    await expect(page).toHaveURL('/title/title-01');
    await expect(page.locator('.detail-art.tier-2')).toBeVisible();
    await expect(page.locator('.detail-art.tier-2')).toHaveText(/Afterlight/i);

});