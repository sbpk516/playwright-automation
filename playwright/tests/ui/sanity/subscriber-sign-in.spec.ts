import {test, expect} from '@playwright/test';

test('SAN002-Subscriber sign in', async({page}) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('river@streamforge.test');
    await page.getByLabel('Password').fill('stream123');
    await page.getByRole('button', {name:'Sign in'}).click();
    await expect(page).toHaveURL(/\/browse$/);
    await expect(page.getByRole('heading',{name:/Find your next obsession/i})).toBeVisible();
    await expect(page.getByRole('navigation', {name:'Primary'})).toBeVisible();
    await expect(page.getByRole('link',{name:'Browse'})).toBeVisible();
    await expect(page.getByRole('link',{name:'My list'})).toBeVisible();
    const browselink = await page.getByRole('link',{name:'Browse'});
    expect(browselink).toBeVisible();
    expect(browselink).toHaveText('Browse');
    await expect(page.getByText('CURATED FOR THE CURIOUS')).toBeVisible();
    await expect(page.getByText(/CURATED FOR THE CURIOUS/i)).toBeVisible();
    const text_verify = page.locator('.browse-hero');
    await expect(text_verify).toContainText(/curated/i);

    await expect(page.getByText(/^Strange worlds. Human stories. Zero algorithms pretending to know you.$/i)).toBeVisible();
    await expect(page.getByRole('button', {name:'Sign out'})).toBeVisible();
    await page.getByRole('button', {name:'Sign out'}).click();
    await expect(page).toHaveURL('/');



})



test('SAN002-001-Subscriber sign in', async({page}) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('river@streamforge.test');
    await page.getByLabel('Password').fill('stream123');
    await page.getByRole('button', {name:'Sign in'}).click();
    await expect(page).toHaveURL(/\/browse$/);
    await expect(page.getByRole('heading',{name:/Find your next obsession/i})).toBeVisible();
    await expect(page.getByRole('navigation', {name:'Primary'})).toBeVisible();
    await expect(page.getByRole('link',{name:'Browse'})).toBeVisible();
    await expect(page.getByRole('link',{name:'My list'})).toBeVisible();
    const browselink = await page.getByRole('link',{name:'Browse'});
    expect(browselink).toBeVisible();
    expect(browselink).toHaveText('Browse');
    await expect(page.getByText('CURATED FOR THE CURIOUS')).toBeVisible();
    await expect(page.getByText(/CURATED FOR THE CURIOUS/i)).toBeVisible();
    const text_verify = page.locator('.browse-hero');
    await expect(text_verify).toContainText(/curated/i);

    await expect(page.getByText(/^Strange worlds. Human stories. Zero algorithms pretending to know you.$/i)).toBeVisible();
    await expect(page.getByRole('button', {name:'Sign out'})).toBeVisible();
    await page.getByRole('button', {name:'Sign out'}).click();
    await expect(page).toHaveURL('/');



})



test('SAN002-002-Subscriber sign in', async({page}) => {
    await page.goto('/sign-in');
    await page.getByLabel('Email').fill('river@streamforge.test');
    await page.getByLabel('Password').fill('stream123');
    await page.getByRole('button', {name:'Sign in'}).click();
    await expect(page).toHaveURL(/\/browse$/);
    await expect(page.getByRole('heading',{name:/Find your next obsession/i})).toBeVisible();
    await expect(page.getByRole('navigation', {name:'Primary'})).toBeVisible();
    await expect(page.getByRole('link',{name:'Browse'})).toBeVisible();
    await expect(page.getByRole('link',{name:'My list'})).toBeVisible();
    const browselink = await page.getByRole('link',{name:'Browse'});
    expect(browselink).toBeVisible();
    expect(browselink).toHaveText('Browse');
    await expect(page.getByText('CURATED FOR THE CURIOUS')).toBeVisible();
    await expect(page.getByText(/CURATED FOR THE CURIOUS/i)).toBeVisible();
    const text_verify = page.locator('.browse-hero');
    await expect(text_verify).toContainText(/curated/i);

    await expect(page.getByText(/^Strange worlds. Human stories. Zero algorithms pretending to know you.$/i)).toBeVisible();
    await expect(page.getByRole('button', {name:'Sign out'})).toBeVisible();
    await page.getByRole('button', {name:'Sign out'}).click();
    await expect(page).toHaveURL('/');



})